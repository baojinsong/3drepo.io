import { mapValues } from 'lodash';

import { hexToRgba, hexToGLColor } from '../helpers/colors';

export const BLACK = '#00000';
export const WHITE = '#ffffff';

export const COLOR = {
	PRIMARY_MAIN: '#0c2f54',
	PRIMARY_LIGHT: '#3c5876',
	PRIMARY_DARK: '#08203a',
	SECONDARY_MAIN: '#06563c',
	SECONDARY_LIGHT: '#377763',
	SECONDARY_DARK: '#043827',

	WHITE,
	WHITE_87: hexToRgba(WHITE, 0.87),

	TRANSPARENT : hexToRgba(WHITE, 0),

	BLACK,
	BLACK_6: hexToRgba(BLACK, .06),
	BLACK_20: hexToRgba(BLACK, .2),
	BLACK_30: hexToRgba(BLACK, .3),
	BLACK_40: hexToRgba(BLACK, .4),
	BLACK_50: hexToRgba(BLACK, .5),
	BLACK_54: hexToRgba(BLACK, .54),
	BLACK_60: hexToRgba(BLACK, .6),
	BLACK_80: hexToRgba(BLACK, .8),
	BLACK_87: hexToRgba(BLACK, .87),

	DARK_GRAY: '#bfbfbf',
	GRAY: '#f0f0f0',
	GRAY_60: 'rgba(189, 189, 189, .6)',
	LIGHT_GRAY: '#fafafa',
	WARNING_LIGHT: '#ffefef',
	WARNING: '#ffd5d5',
	MAROON: '#c9241c',
	CRIMSON: '#dc143c',
	DARK_ORANGE: '#f97807',
	ORANGE: '#fa9034',
	GREEN: '#008241',
	MED_SEA_GREEN: '#2e9863',
	LIME_GREEN: '#4eb227',
	LIGHT_GREEN: '#6ec04e',
	RED: '#d24b45',
	LEMON_CHIFFON: '#f0d92e',
	YELLOW: '#ffff36',
	LIGHT_YELLOW: '#edd100',
	POMEGRANATE: '#F44336',
	NEGATIVE: 'rgba(234, 57, 57, 1)',
	NEGATIVE_87: 'rgba(234, 57, 57, 0.87)'
};

export const PIN_COLORS = mapValues({
	DARK_GRAY: COLOR.DARK_GRAY,
	BLUE: COLOR.PRIMARY_MAIN,
	YELLOW: COLOR.YELLOW,
	RED: COLOR.RED,
	MAROON: COLOR.MAROON,
	CRIMSON: COLOR.CRIMSON,
	DARK_ORANGE: COLOR.DARK_ORANGE,
	ORANGE: COLOR.ORANGE,
	GREEN: COLOR.GREEN,
	MED_SEA_GREEN: COLOR.MED_SEA_GREEN,
	LIME_GREEN: COLOR.LIME_GREEN,
	LIGHT_GREEN: COLOR.LIGHT_GREEN,
	LEMON_CHIFFON: COLOR.LEMON_CHIFFON,
	LIGHT_YELLOW: COLOR.LIGHT_YELLOW
}, hexToGLColor);
