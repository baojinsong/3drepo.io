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

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { pick, get, values } from 'lodash';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import { theme } from '../../styles';
import { CustomTable, CELL_TYPES } from '../components/customTable/customTable.component';
import { TEAMSPACE_PERMISSIONS } from '../../constants/teamspace-permissions';

import { Container, Content, Footer, FloatingButton } from './users.styles';

const USERS_TABLE_CELLS = [{
	name: 'User',
	type: CELL_TYPES.USER,
	searchBy: ['firstName', 'lastName', 'user', 'company']
}, {
	name: 'Job',
	type: CELL_TYPES.JOB
}, {
	name: 'Permissions',
	type: CELL_TYPES.PERMISSIONS
}, {
	type: CELL_TYPES.EMPTY
}, {
	type: CELL_TYPES.ICON_BUTTON
}];

interface IProps {
	users: any[];
	jobs: any[];
	active?: boolean;
	onUsersChange?: void;
}

interface IState {
	rows: any[];
	jobs: any[];
	licencesLabel: string;
	containerElement: Element;
	active: boolean;
}

const teamspacePermissions = values(TEAMSPACE_PERMISSIONS)
	.map(({label: name, isAdmin: value }: {label: string, isAdmin: boolean}) => ({ name, value }));

export class Users extends React.PureComponent<IProps, IState> {
	public static getDerivedStateFromProps(nextProps: IProps, prevState: IState) {
		if (nextProps.active !== prevState.active) {
			return {active: nextProps.active};
		}

		return {
			rows: nextProps.users,
			jobs: nextProps.jobs.map(({_id: name, color}) => ({name, color, value: name}))
		};
	}

	public state = {
		rows: [],
		jobs: [],
		licencesLabel: '',
		containerElement: null,
		active: true
	};

	public onUserChange = (user, updatedValue) => {
		console.log("User changed!", updatedValue);
	}

	public onRemove = () => {
		console.log("User removed!");
	}

	public getUsersTableRows = (users = [], jobs = []): any[] => {
		return users.map((user) => {
			const data = [
				pick(user, ['firstName', 'lastName', 'company', 'user']),
				{
					value: user.job,
					items: jobs,
					onChange: this.onUserChange.bind(null, user)
				},
				{
					value: user.isAdmin,
					items: teamspacePermissions,
					onChange: this.onUserChange.bind(null, user),
					isDisabled: user.isCurrentUser || user.isOwner
				},
				{},
				{
					icon: 'remove_circle',
					onClick: this.onRemove.bind(null, user)
				}
			];
			return { ...user, data };
		});
	}

	public renderFloatingButton = (container) => {
		const button = (
			<FloatingButton
				variant="fab"
				color="secondary"
				aria-label="Add"
				mini={true}
			>
				<Icon>add</Icon>
			</FloatingButton>
		);
		return ReactDOM.createPortal(
			button,
			container
		);
	}

	public componentDidMount() {
		const containerElement = (ReactDOM.findDOMNode(this) as HTMLElement).closest('md-content');
		this.setState({containerElement});
	}

	public render() {
		const { rows, jobs, licencesLabel, containerElement, active } = this.state;

		const preparedRows = this.getUsersTableRows(rows, jobs);
		return (
			<MuiThemeProvider theme={theme}>
				<>
					<Container
						container
						direction="column"
						alignItems="stretch"
						wrap="nowrap"
					>
						<Content item>
							<CustomTable
								cells={USERS_TABLE_CELLS}
								rows={preparedRows}
							/>
						</Content>
						<Footer item>Test{licencesLabel}</Footer>
					</Container>
					{ active && containerElement && this.renderFloatingButton(containerElement)}
				</>
			</MuiThemeProvider>
		);
	}
}
