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
import { MuiThemeProvider } from '@material-ui/core';

import { MuiTheme } from '../../../styles';
import { Container, Logo } from './topMenu.styles';
import { UserMenu } from './components/userMenu/userMenu.component';

interface IProps {
	currentUser: any;
	isLiteMode?: boolean;
	logoUrl?: string;
	onLiteModeChange?: () => void;
	onLogout?: () => void;
	onLogoClick?: () => void;
}

export class TopMenu extends React.PureComponent<IProps, any> {
	public render() {
		const { logoUrl, onLogoClick, ...userMenuProps } = this.props;

		const logoProps = {
			src: logoUrl,
			alt: '3D Repo',
			longdesc: '3DRepoBuildingInformationModellingSoftware',
			onClick: onLogoClick
		};

		return (
			<MuiThemeProvider theme={MuiTheme}>
				<Container>
					<Logo {...logoProps} />
					{userMenuProps.currentUser.username && <UserMenu
						{...userMenuProps}
						onTeamspacesClick={this.props.onLogoClick}
					/>}
				</Container>
			</MuiThemeProvider>
		);
	}
}