import Print from '@material-ui/icons/Print';
import Download from '@material-ui/icons/CloudDownload';
import Delete from '@material-ui/icons/Delete';
import OfflineBolt from '@material-ui/icons/OfflineBolt';
import PanTool from '@material-ui/icons/PanTool';

import { COLOR } from '../styles';

export const GROUP_PANEL_NAME = 'group';

export const GROUPS_TYPES = {
	NORMAL: 'normal',
	SMART: 'smart'
};

export const GROUPS_TYPES_LIST = [{
	label: 'Criteria',
	type: GROUPS_TYPES.SMART
}, {
	label: 'Normal',
	type: GROUPS_TYPES.NORMAL
}];

export const GROUP_TYPES_ICONS = {
	[GROUPS_TYPES.NORMAL]: PanTool,
	[GROUPS_TYPES.SMART]: OfflineBolt
};

export const GROUPS_ACTIONS_ITEMS = {
	OVERRIDE_ALL: 'overrideAll',
	DOWNLOAD: 'download',
	DELETE_ALL: 'deleteAll'
};

export const GROUPS_ACTIONS_MENU = [
	{
		name: GROUPS_ACTIONS_ITEMS.OVERRIDE_ALL,
		label: 'Override All',
		Icon: Print
	},
	{
		name: GROUPS_ACTIONS_ITEMS.DELETE_ALL,
		label: 'Delete All',
		Icon: Delete
	},
	{
		name: GROUPS_ACTIONS_ITEMS.DOWNLOAD,
		label: 'Download JSON',
		Icon: Download
	}
];

export const DEFAULT_OVERRIDE_COLOR = COLOR.BLACK_54;
