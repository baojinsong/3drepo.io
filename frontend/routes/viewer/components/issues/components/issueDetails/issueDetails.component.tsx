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
import AddIcon from '@material-ui/icons/Add';

import { Container } from './issueDetails.styles';
import { ViewerPanelContent, ViewerPanelFooter, ViewerPanelButton } from '../../../viewerPanel/viewerPanel.styles';
import { IssueDetailsForm } from './issueDetailsForm.component';

interface IProps {
	noop: string; // TODO: Remove sample
}

export class IssueDetails extends React.PureComponent<IProps, any> {
	public render() {
		return (
			<Container>
				<ViewerPanelContent className="height-catcher">
					<IssueDetailsForm />
				</ViewerPanelContent>
			</Container>
		);
	}
}
