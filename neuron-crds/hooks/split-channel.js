const fs = require('fs');
const path = require('path');
const lodash = require('lodash');

module.exports = {
	// Hook to split up channels into tenants, namespaces and topics
	'generate:before': generator => {
		const asyncapi = generator.asyncapi;
		const channels = asyncapi._json.channels;
		asyncapi._json.components['tenants'] = {}
		asyncapi._json.components['namespaces'] = {}

		for (const channel in channels) {
			// Split channel name on '/' to parse tenant, namespace and topic
			const parts = channel.split('/');
			const tenant = parts[0];
			const namespace = parts[1];
			const topic = parts[2];

			// Rename channel from tenant/namespace/topic to just topic and adding
			// tenant and namespace metadata.
			// To be able to fetch these variables in our template they need to be
			// prefixed with 'x-' and use `{{channel.ext('x-tenant')}}` in the template.
			channels[topic] = channels[channel];
			channels[topic]['x-tenant'] = tenant;
			channels[topic]['x-namespace'] = namespace;
			delete channels[channel];

			// Put tenants and namespaces into asyncapi.components with minor metadata
			asyncapi._json.components['tenants'][tenant] = {
				'tenantName': tenant,
			};
			asyncapi._json.components['namespaces'][namespace] = {
				'namespaceName': namespace,
				'tenant': tenant,
			};

			// Go through all messages for the topic and set messageId to topic name.
			// I do this so we can set the filename to the topic name when filename is
			// `$$message$$.yaml` -> `topic-name.yaml`.
			// Also adding tenant and namespace in extension variables.
			const c = asyncapi.channel(topic);
			if (c.hasSubscribe()) {
				const messages = c.subscribe().messages();
				for (const m in messages) {
					messages[m]._json['messageId'] = topic;
					messages[m]._json['x-tenant'] = tenant;
					messages[m]._json['x-namespace'] = namespace;
					messages[m]._json['x-type'] = messages[m]._json.contentType;
				}
			}
			if (c.hasPublish()) {
				const messages = c.publish().messages();
				for (const m in messages) {
					messages[m]._json['messageId'] = topic;
					messages[m]._json['x-tenant'] = tenant;
					messages[m]._json['x-namespace'] = namespace;
					messages[m]._json['x-type'] = messages[m]._json.contentType;
				}
			}
		}

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
	// Hook to render custom tenant and namespace templates
	'generate:after': async generator => {
		const asyncapi = generator.asyncapi;
		const root = generator.templateContentDir;

		// Generate tenant template
		const tenants = asyncapi._json.components.tenants;
		const tenant_file = '$$tenant$$-tenant.yaml';
		await generator.generateSeparateFiles(asyncapi, tenants, 'tenant', tenant_file, root);
		// We're unable to completely exclude files from the template.
		// Here we delete the untemplated file the standard renderer already copied over.
		fs.unlinkSync(path.resolve(generator.targetDir, '$$tenant$$-tenant.yaml'));

		// Generate namespace template
		const namespaces = asyncapi._json.components.namespaces;
		const namespace_file = '$$namespace$$-namespace.yaml';
		await generator.generateSeparateFiles(asyncapi, namespaces, 'namespace', namespace_file, root);
		// We're unable to completely exclude files from the template.
		// Here we delete the untemplated file the standard renderer already copied over.
		fs.unlinkSync(path.resolve(generator.targetDir, '$$namespace$$-namespace.yaml'));

		// Render kustomization if enabled
		if (generator.templateParams.kustomize && generator.templateParams.kustomize === 'true') {
			fs.readdir(generator.targetDir, (err, files) => {
				const yaml_files = files.filter(f => /.+\.ya?ml$/.test(f)).filter(f => f !== 'kustomization.yaml');
				generator.renderAndWriteToFile(
					asyncapi,
					path.join(generator.templateDir, 'extras', 'kustomization.yaml'),
					path.join(generator.targetDir, 'kustomization.yaml'),
					{'files': yaml_files}
				);
			});
		}
	}
};
