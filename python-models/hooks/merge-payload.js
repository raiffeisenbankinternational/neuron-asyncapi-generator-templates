const lodash = require('lodash');

module.exports = {
	// Hook to merge 'allOf' in schemas
	'generate:before': generator => {
		const asyncapi = generator.asyncapi;

		// Merging composite schemas when 'allOf' is used.
		asyncapi.allMessages().forEach(message => {
			if (message.payload().allOf()) {
				const allOf = message.payload().allOf();
				for (i in allOf) {
					lodash.mergeWith(message._json.payload, allOf[i]._json, (objVal, srcVal) => {
						if (lodash.isArray(objVal)) {
							return objVal.concat(srcVal);
  						}
					});
				}
			}
		});
	},
};
