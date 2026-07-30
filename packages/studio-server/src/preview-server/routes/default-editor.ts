import {readFileSync} from 'node:fs';
import type {DefaultEditor} from '@remotion/renderer';
import {defaultEditorIds} from '@remotion/renderer';
import type {
	GetDefaultEditorInfoRequest,
	GetDefaultEditorInfoResponse,
	UpdateDefaultEditorRequest,
	UpdateDefaultEditorResponse,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import {parseAst} from '../../codemods/parse-ast';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {getAvailableEditors} from '../../helpers/editor-registry';
import type {ApiHandler} from '../api-types';

export const updateDefaultEditorInConfig = ({
	configContents,
	defaultEditor,
}: {
	configContents: string;
	defaultEditor: DefaultEditor | null;
}) => {
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
				expression.callee.property.name === 'setDefaultEditor'
			) {
				path.prune();
				return false;
			}

			this.traverse(path);
		},
	});

	const configWithoutExistingCalls = recast.print(ast, {
		lineTerminator: '\n',
	}).code;
	if (defaultEditor === null) {
		return configWithoutExistingCalls;
	}

	const separator = configWithoutExistingCalls.endsWith('\n') ? '' : '\n';
	return `${configWithoutExistingCalls}${separator}Config.setDefaultEditor('${defaultEditor}');\n`;
};

export const getDefaultEditorInfoHandler: ApiHandler<
	GetDefaultEditorInfoRequest,
	GetDefaultEditorInfoResponse
> = async ({getDefaultEditor}) => {
	const installedEditors = await getAvailableEditors();
	return {
		defaultEditor: getDefaultEditor(),
		installedEditors: installedEditors.map(({id, name}) => ({id, name})),
	};
};

export const updateDefaultEditorHandler: ApiHandler<
	UpdateDefaultEditorRequest,
	UpdateDefaultEditorResponse
> = async ({input, configFile}) => {
	if (configFile === null || configFile === undefined) {
		return {
			success: false,
			reason: 'No Remotion config file was loaded.',
		};
	}

	if (
		input.defaultEditor !== null &&
		!defaultEditorIds.includes(input.defaultEditor)
	) {
		return {
			success: false,
			reason: `Unknown editor: ${input.defaultEditor}`,
		};
	}

	if (input.defaultEditor !== null) {
		const installedEditors = await getAvailableEditors();
		if (!installedEditors.some(({id}) => id === input.defaultEditor)) {
			return {
				success: false,
				reason: 'The selected editor is not installed.',
			};
		}
	}

	const configContents = readFileSync(configFile, 'utf8');
	writeFileAndNotifyFileWatchers(
		configFile,
		updateDefaultEditorInConfig({
			configContents,
			defaultEditor: input.defaultEditor,
		}),
		undefined,
	);

	return {success: true};
};
