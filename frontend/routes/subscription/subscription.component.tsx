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
import { SubscriptionForm } from './components/subscriptionForm.component';
import { clientConfigService } from './../../services/clientConfig';
import { Container } from './subscription.styles';
import { Loader } from '../components/loader/loader.component';
import { LoaderContainer } from '../billing/billing.styles';

interface IProps {
	billingInfo: any;
	teamspace: any;
	spaceInfo: any;
	licencesInfo: any;
	isLoadingBilling: boolean;
	fetchQuotaInfo: (teamspace) => void;
	fetchBillingData: (teamspace) => void;
	changeSubscription: (teamspace, subscriptionData) => void;
}

export class Subscription extends React.PureComponent<IProps, any> {
	public componentDidMount() {
		this.props.fetchQuotaInfo(this.props.teamspace);
		this.props.fetchBillingData(this.props.teamspace);
	}

	public renderLoader(content) {
		return (
			<LoaderContainer>
				<Loader content={content} />
			</LoaderContainer>
		);
	}

	public render() {
		const { billingInfo, spaceInfo, licencesInfo, changeSubscription, teamspace } = this.props;

		if (this.props.isLoadingBilling) {
			return this.renderLoader(`Loading subscription data...`);
		}

		return (
			<Container>
				<SubscriptionForm
					billingInfo={billingInfo}
					countries={clientConfigService.countries}
					spaceInfo={spaceInfo}
					licencesInfo={licencesInfo}
					teamspace={teamspace}
					changeSubscription={changeSubscription}
				/>
			</Container>
		);
	}
}
