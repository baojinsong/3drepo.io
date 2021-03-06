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

export const selectModelDomain = (state) => Object.assign({}, state.model);

export const selectSettings = createSelector(
	selectModelDomain, (state) => state.settings
);

export const selectRevisions = createSelector(
	selectModelDomain, (state) => state.revisions
);

export const selectIsPending = createSelector(
	selectModelDomain, (state) => state.isPending
);

export const selectUploadStatus = createSelector(
	selectModelDomain, (state) => state.uploadStatus
);

export const selectMaps = createSelector(
	selectModelDomain, (state) => state.maps
);
