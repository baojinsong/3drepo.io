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

import { put, takeLatest } from 'redux-saga/effects';

import * as API from '../../services/api';
import { TeamspacesTypes, TeamspacesActions } from './teamspaces.redux';
import { SnackbarActions } from '../snackbar';
import { DialogActions } from '../dialog';

// Projects
export function* createProject({ teamspace, projectData }) {
	try {
		const response = yield API.createProject(teamspace, projectData);

		yield put(SnackbarActions.show('Project created'));
		yield put(TeamspacesActions.createProjectSuccess(teamspace, response.data));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('create', 'project', e.response));
	}
}

export function* updateProject({ teamspace, projectName, projectData }) {
	try {
		yield API.updateProject(teamspace, projectName, projectData);

		yield put(SnackbarActions.show('Project updated'));
		yield put(TeamspacesActions.updateProjectSuccess(teamspace, projectName, projectData));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('update', 'project', e.response));
	}
}

export function* removeProject({ teamspace, projectName }) {
	try {
		yield API.removeProject(teamspace, projectName);

		yield put(SnackbarActions.show('Project removed'));
		yield put(TeamspacesActions.removeProjectSuccess(teamspace, projectName));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('remove', 'project', e.response));
	}
}

// Models
export function* createModel({ teamspace, modelData }) {
	try {
		const response = yield API.createModel(teamspace, modelData);
		const createdModel = {
			...response.data,
			projectName: modelData.project,
			federate: modelData.federate,
			subModels: modelData.subModels
		};

		yield put(SnackbarActions.show(`${modelData.federate ? 'Federation' : 'Model'} created`));
		yield put(TeamspacesActions.createModelSuccess(teamspace, createdModel));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('create', 'model', e.response));
	}
}

export function* updateModel({ teamspace, modelId, modelData }) {
	try {
		yield API.updateModel(teamspace, modelId, modelData);
		yield put(SnackbarActions.show(`${modelData.federate ? 'Federation' : 'Model'} updated`));
		yield put(TeamspacesActions.updateModelSuccess(teamspace, modelId, modelData));
	} catch (e) {
		yield put(DialogActions.showErrorDialog('update', 'model', e.response));
	}
}

export function* removeModel({ teamspace, modelData }) {
	try {
		const response = yield API.removeModel(teamspace, modelData.id);
		const removedModel = response.data;

		yield put(SnackbarActions.show(`${removedModel.federate ? 'Federation' : 'Model'} removed`));
		yield put(TeamspacesActions.removeModelSuccess(
			teamspace, { ...removedModel, projectName: modelData.project, name: modelData.name })
		);
	} catch (e) {
		yield put(DialogActions.showErrorDialog('remove', 'model', e.response));
	}
}

export default function* TeamspacesSaga() {
	// Projects
	yield takeLatest(TeamspacesTypes.CREATE_PROJECT, createProject);
	yield takeLatest(TeamspacesTypes.UPDATE_PROJECT, updateProject);
	yield takeLatest(TeamspacesTypes.REMOVE_PROJECT, removeProject);
	// Models
	yield takeLatest(TeamspacesTypes.CREATE_MODEL, createModel);
	yield takeLatest(TeamspacesTypes.UPDATE_MODEL, updateModel);
	yield takeLatest(TeamspacesTypes.REMOVE_MODEL, removeModel);
}