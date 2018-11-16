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
import { isEmpty } from 'lodash';
import { runAngularTimeout } from '../../helpers/migration';
import { DialogContainer } from '../components/dialogContainer';
import { SnackbarContainer } from '../components/snackbarContainer';
import { clientConfigService } from '../../services/clientConfig';

interface IProps {
	location: any;
	history: any;
	isAuthenticated: boolean;
	hasActiveSession: boolean;
	authenticate: () => void;
	logout: () => void;
}

interface IState {
	referrer?: string;
	autologoutInterval?: number;
}

const DEFAULT_REDIRECT = '/dashboard/teamspaces';
const MAIN_ROUTE_PATH =  '/';

export class App extends React.PureComponent<IProps, IState> {
	public state = {
		referrer: DEFAULT_REDIRECT,
		autologoutInterval: clientConfigService.login_check_interval || 4
	};

	public is;

	private authenticationInterval;

	public isStaticRoute(path) {
		const staticRoutes = ['cookies', 'terms', 'privacy'] as any;
		return staticRoutes.includes(path.replace('/', ''));
	}

	public componentDidMount() {
		this.props.authenticate();
	}

	public componentWillMount() {
		this.toggleAutoLogout(false);
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const { location, history, isAuthenticated } = this.props;
		const isStaticRoute = this.isStaticRoute(location.pathname);
		if (!isStaticRoute && isAuthenticated !== prevProps.isAuthenticated) {
			if (isAuthenticated) {
				runAngularTimeout(() => {
					history.push(this.state.referrer);
				});
				changes.referrer = DEFAULT_REDIRECT;

				this.toggleAutoLogout();
			} else {
				if (location.pathname !== MAIN_ROUTE_PATH) {
					changes.referrer = `${location.pathname }${ location.search }`;
				}

				this.toggleAutoLogout(false);
				runAngularTimeout(() => {
					history.push('/login');
				});
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public toggleAutoLogout = (shouldStart = true) => {
		if (shouldStart) {
			this.authenticationInterval = setInterval(this.handleAutoLogout, this.state.autologoutInterval * 1000);
		} else {
			clearInterval(this.authenticationInterval);
		}
	}

	public handleAutoLogout = () => {
		const { isAuthenticated, logout, history } = this.props;
		const hasActiveSession = JSON.parse(window.localStorage.getItem('loggedIn'));
		const isSessionExpired = hasActiveSession !== isAuthenticated;
		if (isSessionExpired) {
			history.push('/login');
			logout();
		}
	}

	public render() {
		// TODO: In the future it'll return first level routes eg. Dashboard, Login
		return (
			<>
				<DialogContainer />
				<SnackbarContainer />
			</>
		);
	}
}