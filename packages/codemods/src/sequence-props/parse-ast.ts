import {parse} from '@babel/parser';
import type {File} from '@babel/types';
import * as recast from 'recast';

// Match Recast's babel-ts options without importing its optional babylon fallback,
// which causes module resolution warnings when consumers bundle with Webpack.
const tsParser = {
	parse: (source: string) =>
		parse(source, {
			sourceType: 'module',
			strictMode: false,
			allowImportExportEverywhere: true,
			allowReturnOutsideFunction: true,
			startLine: 1,
			tokens: true,
			plugins: [
				'asyncGenerators',
				'bigInt',
				'classPrivateMethods',
				'classPrivateProperties',
				'classProperties',
				'classStaticBlock',
				'decimal',
				'decorators-legacy',
				'doExpressions',
				'dynamicImport',
				'exportDefaultFrom',
				'exportNamespaceFrom',
				'functionBind',
				'functionSent',
				'importAssertions',
				'importMeta',
				'nullishCoalescingOperator',
				'numericSeparator',
				'objectRestSpread',
				'optionalCatchBinding',
				'optionalChaining',
				['pipelineOperator', {proposal: 'minimal'}],
				['recordAndTuple', {syntaxType: 'hash'}],
				'throwExpressions',
				'topLevelAwait',
				'v8intrinsic',
				'jsx',
				'typescript',
			],
		}),
};

const normalizeImportSpacing = (input: string) =>
	input.replace(/(import[^\n]*\n)\n+(?=import\b)/g, '$1');

export const parseAst = (input: string) => {
	return recast.parse(input, {
		parser: tsParser,
	}) as File;
};

export const parseAstForReadOnly = (input: string) => {
	return tsParser.parse(input) as File;
};

export const serializeAst = (ast: File) => {
	const raw = recast.print(ast, {
		parser: tsParser,
	}).code;
	return normalizeImportSpacing(raw.replace(/\r\n/g, '\n'));
};
