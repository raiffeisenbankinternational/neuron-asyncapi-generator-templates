const filters = module.exports;
const yaml = require('js-yaml');

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

function mapType(fieldType, fieldFormat) {
	const format = fieldFormat || 'default';
	return typeMap[fieldType][format] || typeMap[fieldType]['default'];
}
filters.mapType = mapType;

function toYaml(data, indent) {
	return yaml.dump(data);
}
filters.toYaml = toYaml;
