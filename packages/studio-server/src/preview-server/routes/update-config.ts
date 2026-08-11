import {readFileSync} from 'node:fs';
import {defaultCodingAgentIds, defaultEditorIds} from '@remotion/renderer';
import {
	configMethodLifecycles,
	type ConfigUpdate,
	type ConfigValue,
	type UpdateConfigRequest,
	type UpdateConfigResponse,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import {parseAst} from '../../codemods/parse-ast';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {getAvailableEditors} from '../../helpers/editor-registry';
import type {ApiHandler} from '../api-types';

const validSetterName = /^set[A-Z][A-Za-z0-9]*$/;

const isConfigValue = (value: unknown): value is ConfigValue => {
	if (
		value === null ||
		typeof value === 'string' ||
		typeof value === 'boolean'
	) {
		return true;
	}

	if (typeof value === 'number') {
		return Number.isFinite(value);
	}

	if (Array.isArray(value)) {
		return value.every(isConfigValue);
	}

	if (typeof value === 'object') {
		if (
			Object.getPrototypeOf(value) !== Object.prototype &&
			Object.getPrototypeOf(value) !== null
		) {
			return false;
		}

		return Object.values(value).every(isConfigValue);
	}

	return false;
};

const validateUpdates = (updates: unknown): string | null => {
	if (!Array.isArray(updates) || updates.length === 0) {
		return 'At least one config update is required.';
	}

	const setters = new Set<string>();
	for (const update of updates) {
		if (typeof update !== 'object' || update === null) {
			return 'Each config update must be an object.';
		}

		const {setter, type} = update as Partial<ConfigUpdate>;
		if (
			typeof setter !== 'string' ||
			!validSetterName.test(setter) ||
			!(setter in configMethodLifecycles)
		) {
			return `Invalid config setter: ${JSON.stringify(setter)}.`;
		}

		if (setters.has(setter)) {
			return `The config setter ${setter} was specified more than once.`;
		}

		setters.add(setter);
		if (type === 'delete') {
			continue;
		}

		if (
			type !== 'set' ||
			!('value' in update) ||
			!isConfigValue(update.value)
		) {
			return `Invalid value for Config.${setter}().`;
		}
	}

	return null;
};

export const updateConfigFile = ({
	configContents,
	updates,
}: {
	readonly configContents: string;
	readonly updates: ConfigUpdate[];
}) => {
	const setters = new Set(updates.map(({setter}) => setter));
	const ast = parseAst(configContents);
	recast.types.visit(ast.program, {
		visitExpressionStatement(path) {
			const {expression} = path.node;
			if (
				expression.type === 'CallExpression' &&
				expression.callee.type === 'MemberExpression' &&
				!expression.callee.computed &&
				expression.callee.object.type === 'Identifier' &&
				expression.callee.object.name === 'Config' &&
				expression.callee.property.type === 'Identifier' &&
				setters.has(expression.callee.property.name)
			) {
				path.prune();
				return false;
			}

			this.traverse(path);
		},
	});

	let updatedConfig = recast.print(ast, {lineTerminator: '\n'}).code;
	for (const update of updates) {
		if (update.type === 'delete') {
			continue;
		}

		const serializedValue = JSON.stringify(update.value)
			.replaceAll('\u2028', '\\u2028')
			.replaceAll('\u2029', '\\u2029');
		const statement = parseAst(`Config.${update.setter}(${serializedValue});`)
			.program.body[0];
		const separator = updatedConfig.endsWith('\n') ? '' : '\n';
		updatedConfig += `${separator}${
			recast.prettyPrint(statement, {
				lineTerminator: '\n',
				quote: 'single',
				useTabs: true,
			}).code
		}\n`;
	}

	return updatedConfig;
};

export const updateConfigHandler: ApiHandler<
	UpdateConfigRequest,
	UpdateConfigResponse
> = async ({input, configFile}) => {
	if (configFile === null || configFile === undefined) {
		return {
			success: false,
			reason: 'No Remotion config file was loaded.',
		};
	}

	const validationError = validateUpdates(input.updates);
	if (validationError !== null) {
		return {success: false, reason: validationError};
	}

	for (const update of input.updates) {
		if (update.type === 'delete') {
			continue;
		}

		if (
			update.setter === 'setDefaultCodingAgent' &&
			(typeof update.value !== 'string' ||
				!defaultCodingAgentIds.includes(
					update.value as (typeof defaultCodingAgentIds)[number],
				))
		) {
			return {
				success: false,
				reason: `Unknown coding agent: ${JSON.stringify(update.value)}`,
			};
		}

		if (update.setter === 'setDefaultEditor') {
			if (
				typeof update.value !== 'string' ||
				!defaultEditorIds.includes(
					update.value as (typeof defaultEditorIds)[number],
				)
			) {
				return {
					success: false,
					reason: `Unknown editor: ${JSON.stringify(update.value)}`,
				};
			}

			const installedEditors = await getAvailableEditors();
			if (!installedEditors.some(({id}) => id === update.value)) {
				return {
					success: false,
					reason: 'The selected editor is not installed.',
				};
			}
		}

		if (
			update.setter === 'setPublicLicenseKey' &&
			(typeof update.value !== 'string' ||
				(update.value !== 'free-license' &&
					!update.value.startsWith('rm_pub_')))
		) {
			return {
				success: false,
				reason:
					'The public license key must start with "rm_pub_" or be "free-license".',
			};
		}
	}

	const configContents = readFileSync(configFile, 'utf8');
	writeFileAndNotifyFileWatchers({
		file: configFile,
		content: updateConfigFile({configContents, updates: input.updates}),
		originatorClientId: input.clientId,
		metadata: null,
	});

	return {success: true};
};
