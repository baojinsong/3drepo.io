import { omit, get } from 'lodash';
import { getAPIUrl } from '../services/api';
import { RISK_LEVELS_COLORS, RISK_LEVELS_ICONS } from '../constants/risks';

export const prepareRisk = (risk, jobs = []) => {
	const thumbnail = getAPIUrl(risk.thumbnail);
	const levelOfRisk = risk.level_of_risk || calculateLevelOfRisk(risk.likelihood, risk.consequence);
	const { Icon, color } = getRiskStatus(levelOfRisk, risk.mitigation_status);
	const roleColor = get(jobs.find((job) => job.name === get(risk.assigned_roles, '[0]')), 'color');

	return {
		...risk,
		description: risk.desc,
		author: risk.owner,
		createdDate: risk.created,
		thumbnail,
		StatusIconComponent: Icon,
		statusColor: color,
		roleColor,
		level_of_risk: levelOfRisk
	};
};

export const calculateLevelOfRisk = (likelihood: string, consequence: string): number => {
	let levelOfRisk = 0;

	if (likelihood && consequence) {
		const score: number = parseInt(likelihood, 10) + parseInt(consequence, 10);

		if (6 < score) {
			levelOfRisk = 4;
		} else if (5 < score) {
			levelOfRisk = 3;
		} else if (2 < score) {
			levelOfRisk = 2;
		} else if (1 < score) {
			levelOfRisk = 1;
		} else {
			levelOfRisk = 0;
		}
	}

	return levelOfRisk;
};

export const getRiskStatus = (levelOfRisk: number, mitigationStatus: string) => {
	const statusIcon = {
		Icon: RISK_LEVELS_ICONS[mitigationStatus] || null,
		color: RISK_LEVELS_COLORS[levelOfRisk]
	};

	return statusIcon;
};

export const mergeRiskData = (source, data) => {
	const hasUnassignedRole = !data.assigned_roles;

	return {
		...source,
		...omit(data, ['assigned_roles', 'description']),
		assigned_roles: hasUnassignedRole ? [] : [data.assigned_roles],
		desc: data.description
	};
};