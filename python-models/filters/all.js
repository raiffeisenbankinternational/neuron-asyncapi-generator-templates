const filters = module.exports;

const typeMap = {
	'string': {
		'binary': 'bytes',
		'default': 'string',
	},
	'number': {
		'float': 'float',
		'double': 'double',
		'default': 'float',
	},
	'integer': {
		'int32': 'int',
		'int64': 'long',
		'default': 'int',
	},
	'boolean': {
		'default': 'boolean',
	},
	'null': {
		'default': 'null',
	},
};

const typeClassMap = {
	'bytes': 'Bytes',
	'float': 'Float',
	'double': 'Double',
	'int': 'Integer',
	'long': 'Long',
	'string': 'String',
	'boolean': 'Boolean',
	'null': 'Null',
};

function mapType(fieldType, fieldFormat) {
	const format = fieldFormat || 'default';
	return typeMap[fieldType][format] || typeMap[fieldType]['default'];
}
filters.mapType = mapType;

function mapClassType(fieldType, fieldFormat) {
	return typeClassMap[mapType(fieldType, fieldFormat)];
}
filters.mapClassType = mapClassType;

