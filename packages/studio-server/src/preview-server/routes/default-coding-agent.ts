import {readFileSync} from 'node:fs';
import type {DefaultCodingAgent} from '@remotion/renderer';
import {defaultCodingAgentIds} from '@remotion/renderer';
import type {
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse,
	UpdateDefaultCodingAgentRequest,
	UpdateDefaultCodingAgentResponse,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import {parseAst} from '../../codemods/parse-ast';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import {getAvailableCodingAgents} from '../../helpers/coding-agent-registry';
import type {ApiHandler} from '../api-types';

export const updateDefaultCodingAgentInConfig = ({
	configContents,
	defaultCodingAgent,
}: {
	configContents: string;
	defaultCodingAgent: DefaultCodingAgent | null;
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
				expression.callee.property.name === 'setDefaultCodingAgent'
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
	if (defaultCodingAgent === null) {
		return configWithoutExistingCalls;
	}

	const separator = configWithoutExistingCalls.endsWith('\n') ? '' : '\n';
	return `${configWithoutExistingCalls}${separator}Config.setDefaultCodingAgent('${defaultCodingAgent}');\n`;
};

export const getDefaultCodingAgentInfoHandler: ApiHandler<
	GetDefaultCodingAgentInfoRequest,
	GetDefaultCodingAgentInfoResponse
> = async ({getDefaultCodingAgent}) => {
	const installedCodingAgents = await getAvailableCodingAgents();
	return {
		defaultCodingAgent: getDefaultCodingAgent(),
		installedCodingAgents: installedCodingAgents.map(({id, name}) => ({
			id,
			name,
		})),
	};
};

export const updateDefaultCodingAgentHandler: ApiHandler<
	UpdateDefaultCodingAgentRequest,
	UpdateDefaultCodingAgentResponse
> = ({input, configFile}) => {
	if (configFile === null || configFile === undefined) {
		return Promise.resolve({
			success: false,
			reason: 'No Remotion config file was loaded.',
		});
	}

	if (
		input.defaultCodingAgent !== null &&
		!defaultCodingAgentIds.includes(input.defaultCodingAgent)
	) {
		return Promise.resolve({
			success: false,
			reason: `Unknown coding agent: ${input.defaultCodingAgent}`,
		});
	}

	const configContents = readFileSync(configFile, 'utf8');
	writeFileAndNotifyFileWatchers(
		configFile,
		updateDefaultCodingAgentInConfig({
			configContents,
			defaultCodingAgent: input.defaultCodingAgent,
		}),
		undefined,
	);

	return Promise.resolve({success: true});
};
