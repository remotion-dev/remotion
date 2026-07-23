import {readFileSync} from 'node:fs';
import type {
	UpdatePublicLicenseRequest,
	UpdatePublicLicenseResponse,
} from '@remotion/studio-shared';
import * as recast from 'recast';
import {parseAst} from '../../codemods/parse-ast';
import {writeFileAndNotifyFileWatchers} from '../../file-watcher';
import type {ApiHandler} from '../api-types';

export const updatePublicLicenseInConfig = ({
	configContents,
	publicLicenseKey,
}: {
	configContents: string;
	publicLicenseKey: string;
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
				expression.callee.property.name === 'setPublicLicenseKey'
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
	const separator = configWithoutExistingCalls.endsWith('\n') ? '' : '\n';
	const escapedPublicLicenseKey = publicLicenseKey
		.replaceAll('\\', '\\\\')
		.replaceAll("'", "\\'")
		.replaceAll('\r', '\\r')
		.replaceAll('\n', '\\n')
		.replaceAll('\u2028', '\\u2028')
		.replaceAll('\u2029', '\\u2029');
	return `${configWithoutExistingCalls}${separator}Config.setPublicLicenseKey('${escapedPublicLicenseKey}');\n`;
};

export const updatePublicLicenseHandler: ApiHandler<
	UpdatePublicLicenseRequest,
	UpdatePublicLicenseResponse
> = ({input, configFile}) => {
	if (configFile === null || configFile === undefined) {
		return Promise.resolve({
			success: false,
			reason: 'No Remotion config file was loaded.',
		});
	}

	if (input.publicLicenseKey.length === 0) {
		return Promise.resolve({
			success: false,
			reason: 'The public license key must not be empty.',
		});
	}

	const configContents = readFileSync(configFile, 'utf8');
	writeFileAndNotifyFileWatchers(
		configFile,
		updatePublicLicenseInConfig({
			configContents,
			publicLicenseKey: input.publicLicenseKey,
		}),
		undefined,
	);

	return Promise.resolve({success: true});
};
