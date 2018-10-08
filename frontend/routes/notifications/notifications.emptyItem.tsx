
/**
 *  Copyright (C) 2018 3D Repo Ltd
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
import * as React from "react";
import ListItem from '@material-ui/core/ListItem';
import { Icon } from "@material-ui/core";

export class NotificationEmptyItem extends React.PureComponent {
	public render() {
		return (
			<ListItem style={{height: 'calc(100% - 64px)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center' }}>
				<div>
					<h3 style={{ maxWidth: '142px', fontWeight: 'normal', color: 'rgba(0,0,0,0.54)' }}>
						You have no new notifications.
					</h3>
				</div>
				<div >
					<Icon fontSize="large" color="disabled" >notifications</Icon>
				</div>
			</ListItem>
			);
	}
}
