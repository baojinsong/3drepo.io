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

import { Container } from './reactRoute.styles';
import { ReactButton } from '../components/reactButton/reactButton.component';

interface IProps {
	buttonText: string;
	updateButtonText: any;
	fetchUser: any;
}

export class ReactRoute extends React.PureComponent<IProps, any> {
	public handleReactButtonClick = () => {
		console.debug('Button was clicked');
	}

	public render() {
		const { buttonText } = this.props;

		return (
			<Container>
				<ReactButton
					textValue={buttonText || 'Undefined button text'}
					onClick={this.handleReactButtonClick}
				/>
			</Container>
		);
	}
}