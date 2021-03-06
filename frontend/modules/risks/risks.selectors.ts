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

import { createSelector } from 'reselect';
import { values } from 'lodash';
import { getSortedRisks } from '../../helpers/risks';
import { searchByFilters } from '../../helpers/searching';
import { RISK_LEVELS } from '../../constants/risks';

export const selectRisksDomain = (state) => Object.assign({}, state.risks);

export const selectRisks = createSelector(
	selectRisksDomain, (state) => getSortedRisks(values(state.risksMap))
);

export const selectRisksMap = createSelector(
	selectRisksDomain, (state) => state.risksMap
);

export const selectIsPending = createSelector(
	selectRisksDomain, (state) => state.isPending
);

export const selectComponentState = createSelector(
	selectRisksDomain, (state) => state.componentState
);

export const selectIsRisksPending = createSelector(
	selectRisksDomain, (state) => state.isPending
);

export const selectActiveRiskId = createSelector(
	selectComponentState, (state) => state.activeRisk
);

export const selectActiveRiskDetails = createSelector(
	selectRisksDomain, selectComponentState, (state, componentState) => {
		return state.risksMap[componentState.activeRisk] || componentState.newRisk;
	}
);

export const selectShowDetails = createSelector(
	selectComponentState, (state) => state.showDetails
);

export const selectExpandDetails = createSelector(
	selectComponentState, (state) => state.expandDetails
);

export const selectNewRiskDetails = createSelector(
	selectComponentState, (state) => state.newRisk
);

export const selectNewComment = createSelector(
	selectComponentState, (state) => state.newComment
);

export const selectSearchEnabled = createSelector(
	selectComponentState, (state) => state.searchEnabled
);

export const selectSelectedFilters = createSelector(
	selectComponentState, (state) => state.selectedFilters
);

export const selectFilteredRisks = createSelector(
	selectRisks, selectSelectedFilters, (risks, selectedFilters) => {
		let returnHiddenRisk = false;
		if (selectedFilters.length) {
			returnHiddenRisk = selectedFilters
				.some(({ value: { value } }) => value === RISK_LEVELS.AGREED_FULLY);
		}

		return searchByFilters(risks, selectedFilters, returnHiddenRisk);
	}
);

export const selectShowPins = createSelector(
	selectComponentState, (state) => state.showPins
);

export const selectLogs = createSelector(
	selectComponentState, (state) => state.logs
);

export const selectFetchingDetailsIsPending = createSelector(
	selectComponentState, (state) => state.fetchingDetailsIsPending
);

export const selectFailedToLoad = createSelector(
	selectComponentState, (state) => state.failedToLoad
);

export const selectAssociatedActivities = createSelector(
	selectComponentState, (state) => state.associatedActivities
);
