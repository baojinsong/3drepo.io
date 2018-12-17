/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General License for more details.
 *
 *  You should have received a copy of the GNU Affero General License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { DateTime } from './../dateTime/dateTime.component';

import { Author, Date, StatusIcon, Details, Container, Status } from './previewItemInfo.styles';

interface IProps {
	author: string;
	statusIcon: {
		name: string,
		color: string
	};
	createdAt: string;
}

export class PreviewItemInfo extends React.PureComponent<IProps, any> {
	public render() {
		const { author, createdAt, statusIcon } = this.props;

		return (
			<Container>
				<Details>
					<Status>
						<StatusIcon iconcolor={statusIcon.color} size="small">{statusIcon.name}</StatusIcon>
						<Author>{author}</Author>
					</Status>
					<Date>
						<DateTime value={createdAt} format="DD MMM" />
					</Date>
				</Details>
			</Container>
		);
	}
}
