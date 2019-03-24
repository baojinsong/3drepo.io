export const CRITERIA_DATA_TYPES = {
	FIELD: 1,
	TEXT: 2,
	NUMBER: 3
};

export const CRITERIA_OPERATORS_TYPES = {
	IS_EMPTY: 'IS_EMPTY',
	IS_NOT_EMPTY: 'IS_NOT_EMPTY',
	IS: 'IS',
	IS_NOT: 'IS_NOT',
	CONTAINS: 'CONTAINS',
	NOT_CONTAINS: 'NOT_CONTAINS',
	EQUALS: 'EQUALS',
	NOT_EQUALS: 'NOT_EQUALS',
	GT: 'GT',
	GTE: 'GTE',
	LT: 'LT',
	LTE: 'LTE',
	IN_RANGE: 'IN_RANGE',
	NOT_IN_RANGE: 'NOT_IN_RANGE',
	EXISTS: 'EXISTS',
	NOT_EXISTS: 'NOT_EXISTS',
	REGEX: 'REGEX'
};

export const CRITERIA_OPERATORS_LABELS = {
	[CRITERIA_OPERATORS_TYPES.IS]: 'is',
	[CRITERIA_OPERATORS_TYPES.IS_NOT]: 'is not',
	[CRITERIA_OPERATORS_TYPES.IS_NOT_EMPTY]: 'exists',
	[CRITERIA_OPERATORS_TYPES.IS_EMPTY]: 'does not exist',
	[CRITERIA_OPERATORS_TYPES.CONTAINS]: 'contains',
	[CRITERIA_OPERATORS_TYPES.NOT_CONTAINS]: 'does not contain',
	[CRITERIA_OPERATORS_TYPES.EQUALS]: 'equals',
	[CRITERIA_OPERATORS_TYPES.NOT_EQUALS]: 'does not equal',
	[CRITERIA_OPERATORS_TYPES.GT]: 'greater than',
	[CRITERIA_OPERATORS_TYPES.GTE]: 'greater or equal to',
	[CRITERIA_OPERATORS_TYPES.LT]: 'less than',
	[CRITERIA_OPERATORS_TYPES.LTE]: 'less or equal to',
	[CRITERIA_OPERATORS_TYPES.IN_RANGE]: 'in range',
	[CRITERIA_OPERATORS_TYPES.NOT_IN_RANGE]: 'not in range',
	[CRITERIA_OPERATORS_TYPES.REGEX]: 'Regex'
};

export const CRITERIA_REQUIRED_VALUES = {
	[CRITERIA_OPERATORS_TYPES.IS_EMPTY]: 0,
	[CRITERIA_OPERATORS_TYPES.IS_NOT_EMPTY]: 0,
	[CRITERIA_OPERATORS_TYPES.IS]: 1,
	[CRITERIA_OPERATORS_TYPES.CONTAINS]: 1,
	[CRITERIA_OPERATORS_TYPES.NOT_CONTAINS]: 1,
	[CRITERIA_OPERATORS_TYPES.EQUALS]: 1,
	[CRITERIA_OPERATORS_TYPES.NOT_EQUALS]: 1,
	[CRITERIA_OPERATORS_TYPES.GT]: 1,
	[CRITERIA_OPERATORS_TYPES.GTE]: 1,
	[CRITERIA_OPERATORS_TYPES.LT]: 1,
	[CRITERIA_OPERATORS_TYPES.LTE]: 1,
	[CRITERIA_OPERATORS_TYPES.IN_RANGE]: 2,
	[CRITERIA_OPERATORS_TYPES.NOT_IN_RANGE]: 2
};

export const CRITERIA_TEMPLATES = {
	[CRITERIA_OPERATORS_TYPES.IS]: '%field : %values',
	[CRITERIA_OPERATORS_TYPES.IS_NOT]: '%field : ! %values',
	[CRITERIA_OPERATORS_TYPES.IS_NOT_EMPTY]: '%field',
	[CRITERIA_OPERATORS_TYPES.IS_EMPTY]: '! %field',
	[CRITERIA_OPERATORS_TYPES.CONTAINS]: '%field : * %values',
	[CRITERIA_OPERATORS_TYPES.NOT_CONTAINS]: '%field : ! * %values',
	[CRITERIA_OPERATORS_TYPES.EQUALS]: '%field = %values',
	[CRITERIA_OPERATORS_TYPES.NOT_EQUALS]: '%field = ! %values',
	[CRITERIA_OPERATORS_TYPES.GT]: '%field > %0',
	[CRITERIA_OPERATORS_TYPES.GTE]: '%field >= %0',
	[CRITERIA_OPERATORS_TYPES.LT]: '%field < %0',
	[CRITERIA_OPERATORS_TYPES.LTE]: '%field <= %0',
	[CRITERIA_OPERATORS_TYPES.IN_RANGE]: '%field [ %0 : %0 ]',
	[CRITERIA_OPERATORS_TYPES.NOT_IN_RANGE]: '%field ! [ %0 : %0 ]',
	[CRITERIA_OPERATORS_TYPES.REGEX]: '%field : / %0 /'
};

const CRITERIA_FIELD = {
	name: 'Field',
	operators: [{
		label: CRITERIA_OPERATORS_LABELS.IS_NOT_EMPTY,
		operator: CRITERIA_OPERATORS_TYPES.IS_NOT_EMPTY
	}, {
		label: CRITERIA_OPERATORS_LABELS.IS_EMPTY,
		operator: CRITERIA_OPERATORS_TYPES.IS_EMPTY
	}]
};

const CRITERIA_TEXT = {
	name: 'Text',
	operators: [{
		label: CRITERIA_OPERATORS_LABELS.IS,
		operator: CRITERIA_OPERATORS_TYPES.IS
	}, {
		label: CRITERIA_OPERATORS_LABELS.IS_NOT,
		operator: CRITERIA_OPERATORS_TYPES.IS_NOT
	}, {
		label: CRITERIA_OPERATORS_LABELS.CONTAINS,
		operator: CRITERIA_OPERATORS_TYPES.CONTAINS
	}, {
		label: CRITERIA_OPERATORS_LABELS.NOT_CONTAINS,
		operator: CRITERIA_OPERATORS_TYPES.NOT_CONTAINS
	}, {
		label: CRITERIA_OPERATORS_LABELS.REGEX,
		operator: CRITERIA_OPERATORS_TYPES.REGEX
	}]
};

const CRITERIA_NUMBER = {
	name: 'Number',
	operators: [{
		label: CRITERIA_OPERATORS_LABELS.EQUALS,
		operator: CRITERIA_OPERATORS_TYPES.EQUALS
	}, {
		label: CRITERIA_OPERATORS_LABELS.NOT_EQUALS,
		operator: CRITERIA_OPERATORS_TYPES.NOT_EQUALS
	}, {
		label: CRITERIA_OPERATORS_LABELS.GT,
		operator: CRITERIA_OPERATORS_TYPES.GT
	}, {
		label: CRITERIA_OPERATORS_LABELS.GTE,
		operator: CRITERIA_OPERATORS_TYPES.GTE
	}, {
		label: CRITERIA_OPERATORS_LABELS.LT,
		operator: CRITERIA_OPERATORS_TYPES.LT
	}, {
		label: CRITERIA_OPERATORS_LABELS.LTE,
		operator: CRITERIA_OPERATORS_TYPES.LTE
	}, {
		label: CRITERIA_OPERATORS_LABELS.IN_RANGE,
		operator: CRITERIA_OPERATORS_TYPES.IN_RANGE
	}, {
		label: CRITERIA_OPERATORS_LABELS.NOT_IN_RANGE,
		operator: CRITERIA_OPERATORS_TYPES.NOT_IN_RANGE
	}]
};

export const CRITERIA_LIST = [
	CRITERIA_FIELD,
	CRITERIA_TEXT,
	CRITERIA_NUMBER
];

export const VALUE_FIELD_TYPES = {
	SINGLE: 'SINGLE',
	RANGE: 'RANGE',
	MULTIPLE: 'MULTIPLE',
	EMPTY: 'EMPTY'
};

export const VALUE_DATA_TYPES = {
	TEXT: 'TEXT',
	NUMBER: 'NUMBER'
};

export const VALUE_FIELD_MAP = {
	[CRITERIA_OPERATORS_TYPES.CONTAINS]: {
		fieldType: VALUE_FIELD_TYPES.MULTIPLE,
		dataType: VALUE_DATA_TYPES.TEXT
	},
	[CRITERIA_OPERATORS_TYPES.EQUALS]: {
		fieldType: VALUE_FIELD_TYPES.MULTIPLE,
		dataType: VALUE_DATA_TYPES.NUMBER
	},
	[CRITERIA_OPERATORS_TYPES.EXISTS]: {
		fieldType: VALUE_FIELD_TYPES.EMPTY
	},
	[CRITERIA_OPERATORS_TYPES.GT]: {
		fieldType: VALUE_FIELD_TYPES.SINGLE,
		dataType: VALUE_DATA_TYPES.NUMBER
	},
	[CRITERIA_OPERATORS_TYPES.GTE]: {
		fieldType: VALUE_FIELD_TYPES.SINGLE,
		dataType: VALUE_DATA_TYPES.NUMBER
	},
	[CRITERIA_OPERATORS_TYPES.IN_RANGE]: {
		fieldType: VALUE_FIELD_TYPES.RANGE,
		dataType: VALUE_DATA_TYPES.NUMBER
	},
	[CRITERIA_OPERATORS_TYPES.IS]: {
		fieldType: VALUE_FIELD_TYPES.MULTIPLE,
		dataType: VALUE_DATA_TYPES.TEXT
	},
	[CRITERIA_OPERATORS_TYPES.IS_EMPTY]: {
		fieldType: VALUE_FIELD_TYPES.EMPTY
	},
	[CRITERIA_OPERATORS_TYPES.IS_NOT]: {
		fieldType: VALUE_FIELD_TYPES.MULTIPLE,
		dataType: VALUE_DATA_TYPES.TEXT
	},
	[CRITERIA_OPERATORS_TYPES.IS_NOT_EMPTY]: {
		fieldType: VALUE_FIELD_TYPES.EMPTY
	},
	[CRITERIA_OPERATORS_TYPES.LT]: {
		fieldType: VALUE_FIELD_TYPES.SINGLE,
		dataType: VALUE_DATA_TYPES.NUMBER
	},
	[CRITERIA_OPERATORS_TYPES.LTE]: {
		fieldType: VALUE_FIELD_TYPES.SINGLE,
		dataType: VALUE_DATA_TYPES.NUMBER
	},
	[CRITERIA_OPERATORS_TYPES.NOT_CONTAINS]: {
		fieldType: VALUE_FIELD_TYPES.MULTIPLE,
		dataType: VALUE_DATA_TYPES.TEXT
	},
	[CRITERIA_OPERATORS_TYPES.NOT_EQUALS]: {
		fieldType: VALUE_FIELD_TYPES.MULTIPLE,
		dataType: VALUE_DATA_TYPES.NUMBER
	},
	[CRITERIA_OPERATORS_TYPES.NOT_EXISTS]: {
		fieldType: VALUE_FIELD_TYPES.EMPTY
	},
	[CRITERIA_OPERATORS_TYPES.NOT_IN_RANGE]: {
		fieldType: VALUE_FIELD_TYPES.RANGE,
		dataType: VALUE_DATA_TYPES.NUMBER
	},
	[CRITERIA_OPERATORS_TYPES.REGEX]: {
		fieldType: VALUE_FIELD_TYPES.SINGLE,
		dataType: VALUE_DATA_TYPES.TEXT
	}
} as any;

export const REGEX_INFO_URL = 'https://3drepo.com/regex-for-data-validation/';
export const REGEX_INFO_TEXT = 'More about Regex';
