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

import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { connect, addRouting } from '../../helpers/migration';

import { Teamspaces } from './teamspaces.component';
import { selectCurrentTeamspace, selectIsPending } from '../../modules/teamspace';
import { selectTeamspaces, TeamspacesActions } from '../../modules/teamspaces';
import { ModelActions } from './../../modules/model';

import { DialogActions } from '../../modules/dialog';

const mapStateToProps = createStructuredSelector({
	currentTeamspace: selectCurrentTeamspace,
	teamspaces: selectTeamspaces,
	isPending: selectIsPending
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	showDialog: DialogActions.showDialog,
	showConfirmDialog: DialogActions.showConfirmDialog,
	createProject: TeamspacesActions.createProject,
	updateProject: TeamspacesActions.updateProject,
	removeProject: TeamspacesActions.removeProject,
	createModel: TeamspacesActions.createModel,
	updateModel: TeamspacesActions.updateModel,
	removeModel: TeamspacesActions.removeModel,
	downloadModel: ModelActions.downloadModel
}, dispatch);

export default addRouting(withRouter(connect(mapStateToProps, mapDispatchToProps)(Teamspaces)));
