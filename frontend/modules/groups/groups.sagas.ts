/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { put, takeLatest, takeEvery, select, all} from 'redux-saga/effects';
import { getAngularService } from '../../helpers/migration';

import * as API from '../../services/api';
import { GroupsTypes, GroupsActions } from './groups.redux';
import { DialogActions } from '../dialog';
import {
	selectAreAllOverrided,
	selectColorOverrides,
	selectGroups
} from './groups.selectors';
import { Viewer } from '../../services/viewer/viewer';
import { MultiSelect } from '../../services/viewer/multiSelect';

export function* fetchGroups({teamspace, modelId, revision}) {
	yield put(GroupsActions.togglePendingState(true));
	try {
		const {data} = yield API.getGroups(teamspace, modelId, revision);
		yield put(GroupsActions.fetchGroupsSuccess(data));
	} catch (error) {
		yield put(DialogActions.showErrorDialog('get', 'groups', error));
	}
	yield put(GroupsActions.togglePendingState(false));
}

export function* setActiveGroup({ group, filteredGroups, revision }) {
	try {
		yield all([
			put(GroupsActions.selectGroup(group, filteredGroups, revision)),
			put(GroupsActions.setComponentState({ activeGroup: group._id }))
		]);
	} catch (error) {
		yield put(DialogActions.showErrorDialog('set', 'group as active', error));
	}
}

export function* highlightGroup({ group }) {
	try {
		const color = group.color ? group.color.map((c) => c / 255) :
		Viewer.getDefaultHighlightColor();
		yield put(GroupsActions.addToHighlighted(group._id));

		const TreeService = getAngularService('TreeService') as any;
		if (group.objects && group.objects.length > 0) {
			return TreeService.showNodesBySharedIds(group.objects).then(() => {
				return TreeService.selectNodesBySharedIds(group.objects, color);
			});
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('higlight', 'group', error));
	}
}

export function* dehighlightGroup({ group }) {
	try {
		yield put(GroupsActions.removeFromHighlighted(group._id));

		const TreeService = getAngularService('TreeService') as any;

		TreeService.getNodesFromSharedIds(group.objects)
			.then((nodes) => {
				TreeService.deselectNodes(nodes).then((meshes) => {
					// this.setTotalSavedMeshes(group);
				});
			});
	} catch (error) {
		yield put(DialogActions.showErrorDialog('dehiglight', 'group', error));
	}
}

export function* clearSelectionHighlights() {
	try {
		yield put(GroupsActions.setComponentState({ highlightedGroups: [] }));
		const TreeService = getAngularService('TreeService') as any;
		TreeService.clearCurrentlySelected();
	} catch (error) {
		yield put(DialogActions.showErrorDialog('clear', 'highlighted groups', error));
	}
}

export function* selectGroup({ group }) {
	try {
		const addGroup = MultiSelect.isAccumMode();
		const removeGroup = MultiSelect.isDecumMode();
		const multiSelect = addGroup || removeGroup;

		if (!multiSelect) {
			yield put(GroupsActions.clearSelectionHighlights());
		}

		if (removeGroup) {
			yield put(GroupsActions.dehighlightGroup(group));
		} else {
			yield put(GroupsActions.highlightGroup(group));

		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('select', 'group', error));
	}
}

export function* addColorOverride({ group }) {
	try {
		const color = group.color.map((c) => c / 255);
		const TreeService = getAngularService('TreeService') as any;
		const treeMap = yield TreeService.getMap();

		if (treeMap) {
			const nodes = yield TreeService.getNodesFromSharedIds(group.objects);

			if (nodes) {
				const filteredNodes = nodes.filter((n) => n !== undefined);
				const meshes = TreeService.getMeshMapFromNodes(filteredNodes);

				for (const key in meshes) {
					if (key) {
						const meshIds = meshes[key].meshes;
						const pair = key.split('@');
						const modelAccount = pair[0];
						const modelId = pair[1];
						Viewer.overrideMeshColor(modelAccount, modelId, meshIds, color);
					}
				}
				const colorOverride = {
					models: meshes, color
				};
				yield put(GroupsActions.addToOverrided(group._id, colorOverride));
			}
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('color', 'override', error));
	}
}

export function* removeColorOverride({ groupId, overridedGroup }) {
	try {
		if (overridedGroup) {
			for (const key in overridedGroup.models) {
				if (overridedGroup.models.hasOwnProperty(key)) {
					const meshIds = overridedGroup.models[key].meshes;
					const pair = key.split('@');
					const account = pair[0];
					const model = pair[1];

					Viewer.resetMeshColor(account, model, meshIds);
				}
			}
			yield put(GroupsActions.removeFromOverrided(groupId));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

export function* toggleColorOverride({ group }) {
	try {
		const colorOverrides = yield select(selectColorOverrides);
		const hasColorOverride = colorOverrides[group._id];

		if (!hasColorOverride) {
			yield put(GroupsActions.addColorOverride(group));
		} else {
			const overridedGroup = colorOverrides[group._id];
			yield put(GroupsActions.removeColorOverride(group._id, overridedGroup));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

export function* toggleColorOverrideAll() {
	try {
		const allOverrided = yield select(selectAreAllOverrided);

		if (allOverrided) {
			const colorOverrides = yield select(selectColorOverrides);
			yield all(
				Object.keys(colorOverrides).map((groupId) => {
					return put(GroupsActions.removeColorOverride(groupId, colorOverrides[groupId]));
				})
			);
			yield put(GroupsActions.setComponentState({ overrideAll: false }));
		} else {
			const groups = yield select(selectGroups);
			yield all(groups.map((group) => {
				return put(GroupsActions.addColorOverride(group));
			}));
			yield put(GroupsActions.setComponentState({ overrideAll: true }));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('toggle', 'color override', error));
	}
}

export default function* GroupsSaga() {
	yield takeLatest(GroupsTypes.FETCH_GROUPS, fetchGroups);
	yield takeLatest(GroupsTypes.SET_ACTIVE_GROUP, setActiveGroup);
	yield takeLatest(GroupsTypes.SELECT_GROUP, selectGroup);
	yield takeLatest(GroupsTypes.HIGHLIGHT_GROUP, highlightGroup);
	yield takeLatest(GroupsTypes.DEHIGHLIGHT_GROUP, dehighlightGroup);
	yield takeLatest(GroupsTypes.CLEAR_SELECTION_HIGHLIGHTS, clearSelectionHighlights);
	yield takeEvery(GroupsTypes.ADD_COLOR_OVERRIDE, addColorOverride);
	yield takeEvery(GroupsTypes.REMOVE_COLOR_OVERRIDE, removeColorOverride);
	yield takeLatest(GroupsTypes.TOGGLE_COLOR_OVERRIDE, toggleColorOverride);
	yield takeLatest(GroupsTypes.TOGGLE_COLOR_OVERRIDE_ALL, toggleColorOverrideAll);
}
