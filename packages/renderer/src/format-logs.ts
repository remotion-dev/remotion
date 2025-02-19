import type {
	DevtoolsRemoteObject,
	ObjectPreview,
	PropertyPreview,
} from './browser/devtools-types';
import {chalk} from './chalk';

export const formatRemoteObject = (remoteObject: DevtoolsRemoteObject) => {
	if (remoteObject.preview) {
		return formatObjectPreview(remoteObject.preview);
	}

	if (remoteObject.type === 'string') {
		return chalk.reset(`${remoteObject.value}`);
	}

	if (remoteObject.type === 'number') {
		return chalk.yellow(`${remoteObject.value}`);
	}

	if (remoteObject.type === 'bigint') {
		return chalk.yellow(`${remoteObject.description}`);
	}

	if (remoteObject.type === 'boolean') {
		return chalk.yellow(`${remoteObject.value}`);
	}

	if (remoteObject.type === 'function') {
		return chalk.cyan(String(remoteObject.description));
	}

	if (remoteObject.type === 'object') {
		if (remoteObject.subtype === 'null') {
			return chalk.white(`null`);
		}

		return chalk.reset(`Object`);
	}

	if (remoteObject.type === 'symbol') {
		return chalk.green(`${remoteObject.description}`);
	}

	if (remoteObject.type === 'undefined') {
		return chalk.gray(`undefined`);
	}

	throw new Error('unhandled remote object');
};

export const formatObjectPreview = (preview: ObjectPreview) => {
	if (typeof preview === 'undefined') {
		return '';
	}

	if (preview.type === 'object') {
		if (preview.subtype === 'date') {
			return chalk.reset(
				`Date { ${chalk.magenta(String(preview.description))} }`,
			);
		}

		const properties = preview.properties.map((property) => {
			return chalk.reset(`${property.name}: ${formatProperty(property)}`);
		});

		if (preview.subtype === 'array') {
			if (preview.overflow) {
				return chalk.reset(
					`[ ${preview.properties
						.map((p) => formatProperty(p))
						.join(', ')}, …]`,
				);
			}

			return chalk.reset(
				`[ ${preview.properties.map((p) => formatProperty(p)).join(', ')} ]`,
			);
		}

		if (preview.subtype === 'arraybuffer') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'dataview') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'generator') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'iterator') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'map') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'node') {
			return chalk.magenta(`<${preview.description}>`);
		}

		if (preview.subtype === 'null') {
			return chalk.white(String(preview.description));
		}

		if (preview.subtype === 'promise') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'proxy') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'regexp') {
			return chalk.red(String(preview.description));
		}

		if (preview.subtype === 'set') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'typedarray') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'error') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'wasmvalue') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'weakmap') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'weakset') {
			return chalk.reset(String(preview.description));
		}

		if (preview.subtype === 'webassemblymemory') {
			return chalk.reset(String(preview.description));
		}

		if (properties.length === 0) {
			return chalk.reset('{}');
		}

		if (preview.overflow) {
			return chalk.reset(`{ ${properties.join(', ')}, …}`);
		}

		return chalk.reset(`{ ${properties.join(', ')} }`);
	}

	return '';
};

const formatProperty = (property: PropertyPreview | DevtoolsRemoteObject) => {
	if (property.type === 'string') {
		return chalk.green(`"${property.value}"`);
	}

	if (property.type === 'object') {
		if (!property.subtype && property.value === 'Object') {
			return chalk.reset(`{…}`);
		}

		if (property.subtype === 'date') {
			return chalk.reset(`Date { ${chalk.magenta(String(property.value))} }`);
		}

		if (property.subtype === 'arraybuffer') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'array') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'dataview') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'error') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'generator') {
			return chalk.reset(`[generator ${property.value}]`);
		}

		if (property.subtype === 'iterator') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'map') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'node') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'null') {
			return chalk.white(`${property.value}`);
		}

		if (property.subtype === 'promise') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'proxy') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'regexp') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'set') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'typedarray') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'wasmvalue') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'webassemblymemory') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'weakmap') {
			return chalk.reset(`${property.value}`);
		}

		if (property.subtype === 'weakset') {
			return chalk.reset(`${property.value}`);
		}

		return chalk.reset(`${property.value}`);
	}

	if (property.type === 'accessor') {
		return chalk.gray(`get()`);
	}

	if (property.type === 'bigint') {
		return chalk.yellow(`${property.value}`);
	}

	if (property.type === 'boolean') {
		return chalk.yellow(`${property.value}`);
	}

	if (property.type === 'function') {
		return chalk.cyan(`Function`);
	}

	if (property.type === 'number') {
		return chalk.yellow(`${property.value}`);
	}

	if (property.type === 'symbol') {
		return chalk.green(`${property.value}`);
	}

	if (property.type === 'undefined') {
		return chalk.gray(`undefined`);
	}

	throw new Error('unexpected property type ' + JSON.stringify(property));
};
