import * as React from 'react';
import * as Yup from 'yup';
import { debounce, get, isEmpty, isEqual } from 'lodash';
import { connect, Field, Form, withFormik, Formik } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';

import {
	LEVELS_OF_RISK,
	RISK_CATEGORIES,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES
} from '../../../../../../constants/risks';
import { calculateLevelOfRisk, canUpdateRisk } from '../../../../../../helpers/risks';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { TextField } from '../../../../../components/textField/textField.component';
import { FieldsRow, StyledFormControl, DescriptionImage } from './riskDetails.styles';
import { Image } from '../../../../../components/image';

const RiskSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	mitigation_desc: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

interface IProps {
	risk: any;
	jobs: any[];
	values: any;
	formik: any;
	associatedActivities: any[];
	permissions: any;
	currentUser: any;
	myJob: any;
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
}

interface IState {
	isSaving: boolean;
	canUpdateRisk: boolean;
}

class RiskDetailsFormComponent extends React.PureComponent<IProps, IState> {
	public formRef = React.createRef();

	public state = {
		isSaving: false,
		canUpdateRisk: false
	};

	get isNewRisk() {
		return !this.props.risk._id;
	}

	public componentDidMount() {
		const { risk, currentUser, permissions, myJob } = this.props;

		if (risk && currentUser && permissions && myJob) {
			this.setState({
				canUpdateRisk: canUpdateRisk(risk, myJob, permissions, currentUser)
			});
		}
	}

	public componentDidUpdate(prevProps) {
		const { risk, currentUser, permissions, myJob } = this.props;
		const changes = {} as IState;
		const { values, formik } = this.props;
		const valuesChanged = !isEqual(prevProps.values, values);
		const permissionsChanged = !isEqual(prevProps.permissions, permissions);

		if (permissionsChanged && risk && currentUser && permissions && myJob) {
			changes.canUpdateRisk = canUpdateRisk(risk, myJob, permissions, currentUser);
		}

		if (formik.dirty) {
			if (valuesChanged && !this.state.isSaving) {
				const likelihoodChanged = prevProps.values.likelihood !== values.likelihood;
				const consequenceChanged = prevProps.values.consequence !== values.consequence;

				if (likelihoodChanged || consequenceChanged) {
					this.updateLevelOfRisk();
				}

				this.autoSave();
			}

			if (valuesChanged && this.state.isSaving) {
				changes.isSaving = false;
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public updateLevelOfRisk = () => {
		const { formik } = this.props;
		const { likelihood, consequence } = formik.values;
		const levelOfRisk = calculateLevelOfRisk(likelihood, consequence);
		formik.setFieldValue('level_of_risk', levelOfRisk);
	}

	public autoSave = debounce(() => {
		const { formik, handleSubmit } = this.props;
		if (!formik.isValid) {
			return;
		}

		this.setState({ isSaving: true }, () => {
			this.props.formik.setFieldValue();
			handleSubmit();
			this.setState({ isSaving: false });
		});
	}, 200);

	public handleChangeAndSubmit = (event) => {
		event.persist();
		this.props.handleChange(event);
		this.props.handleSubmit();
	}

	public render() {
		return (
			<Form>
				<FieldsRow container alignItems="center" justify="space-between">
					<Field name="safetibase_id" render={({ field }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							validationSchema={RiskSchema}
							label="SafetiBase ID"
							disabled={!this.state.canUpdateRisk}
						/>
					)} />

					<Field name="associated_activity" render={({ field }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							label="Associated Activity"
							disabled={!this.state.canUpdateRisk}
						/>
					)} />
				</FieldsRow>

				<Field name="description" render={({ field, form }) => (
					<TextField
						{...field}
						requiredConfirm={!this.isNewRisk}
						validationSchema={RiskSchema}
						fullWidth
						multiline
						label="Description"
						disabled={!this.state.canUpdateRisk}
					/>
				)} />

				{this.props.risk.descriptionThumbnail && (
					<DescriptionImage>
						<Image
							src={this.props.risk.descriptionThumbnail}
							enablePreview
						/>
					</DescriptionImage>
				)}

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="assigned_roles">Risk owner</InputLabel>
						<Field name="assigned_roles" render={({ field }) => (
							<CellSelect
								{...field}
								items={this.props.jobs}
								inputId="assigned_roles"
								disabled={!this.state.canUpdateRisk}
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="category">Category</InputLabel>
						<Field name="category" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_CATEGORIES}
								inputId="category"
								disabled={!this.state.canUpdateRisk}
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="likelihood">Risk Likelihood</InputLabel>
						<Field name="likelihood" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_LIKELIHOODS}
								inputId="likelihood"
								disabled={!this.state.canUpdateRisk}
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="consequence">Risk Consequence</InputLabel>
						<Field name="consequence" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_CONSEQUENCES}
								inputId="consequence"
								disabled={!this.state.canUpdateRisk}
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="level_of_risk">Level of Risk</InputLabel>
						<Field name="level_of_risk" render={({ field }) => (
							<CellSelect
								{...field}
								items={LEVELS_OF_RISK}
								inputId="level_of_risk"
								disabled={true}
								readOnly
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="mitigation_status">Mitigation Status</InputLabel>
						<Field name="mitigation_status" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_MITIGATION_STATUSES}
								inputId="mitigation_status"
								disabled={!this.state.canUpdateRisk}
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<Field name="mitigation_desc" render={({ field, form }) => (
					<TextField
						{...field}
						requiredConfirm={!this.isNewRisk}
						validationSchema={RiskSchema}
						fullWidth
						multiline
						label="Mitigation"
						disabled={!this.state.canUpdateRisk}
					/>
				)} />
			</Form>
		);
	}
}

export const RiskDetailsForm = withFormik({
	mapPropsToValues: ({ risk }) => {
		return ({
			safetibase_id: risk.safetibase_id || '',
			associated_activity: risk.associated_activity || '',
			mitigation_status: risk.mitigation_status || '',
			mitigation_desc: risk.mitigation_desc || '',
			description: risk.description || '',
			assigned_roles: get(risk, 'assigned_roles[0]', ''),
			category: risk.category || '',
			likelihood: risk.likelihood,
			consequence: risk.consequence,
			level_of_risk: risk.level_of_risk
		});
	},
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: RiskSchema
})(connect(RiskDetailsFormComponent as any)) as any;