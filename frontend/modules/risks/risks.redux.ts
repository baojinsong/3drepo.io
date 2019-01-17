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

import { createActions, createReducer } from 'reduxsauce';
import { keyBy, cloneDeep, values } from 'lodash';

export const { Types: RisksTypes, Creators: RisksActions } = createActions({
	fetchRisks: ['teamspace', 'modelId', 'revision'],
	fetchRisksSuccess: ['risks'],
	setComponentState: ['componentState'],
	saveRisk: ['teamspace', 'modelId', 'riskData'],
	updateRisk: ['teamspace', 'modelId', 'riskData'],
	saveRiskSuccess: ['risk'],
	setNewRisk: []
}, { prefix: 'RISKS_' });

export const INITIAL_STATE = {
	risksMap: {},
	isPending: true,
	componentState: {
		activeRisk: null,
		showDetails: false,
		expandDetails: true,
		newRisk: {},
		newComment: {}
	}
};

export const fetchRisksSuccess = (state = INITIAL_STATE, { risks = [] }) => {
	const risksMap = keyBy(risks, '_id');
	return { ...state, risksMap, activeRisk: null, showDetails: false };
};

export const saveRiskSuccess = (state = INITIAL_STATE, { risk }) => {
	const risksMap = cloneDeep(state.risksMap);
	risksMap[risk._id] = risk;
	return { ...state, risksMap };
};

export const setComponentState = (state = INITIAL_STATE, { componentState = {} }) => {
	return { ...state, componentState: { ...state.componentState, ...componentState } };
};

export const setNewRisk = (state = INITIAL_STATE) => {
	const riskNumber = values(state.risksMap).length + 1;
	const newRisk = {
		name: `Untitled risk ${riskNumber}`,
		associated_activity: 0,
		assigned_roles: [],
		likelihood: 0,
		consequence: 0,
		level_of_risk: 0,
		mitigation_status: ''
	};
	return setComponentState(state, { componentState: {
		showDetails: true,
		activeRisk: null,
		newRisk
	}});
};

export const reducer = createReducer(INITIAL_STATE, {
	[RisksTypes.FETCH_RISKS_SUCCESS]: fetchRisksSuccess,
	[RisksTypes.SET_COMPONENT_STATE]: setComponentState,
	[RisksTypes.SAVE_RISK_SUCCESS]: saveRiskSuccess,
	[RisksTypes.SET_NEW_RISK]: setNewRisk
});