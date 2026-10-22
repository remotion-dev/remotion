import type {Expression} from '@babel/types';
import {format, resolveConfig, resolveConfigFile} from 'prettier';
import type {SequenceNodePath} from 'remotion';
import {parseAst} from '../codemods/parse-ast';
import {lineColumnToNodePath as _lineColumnToNodePath} from '../preview-server/routes/can-update-sequence-props';

export const prettify = async (input: string): Promise<string> => {
	const configFilePath = await resolveConfigFile();
	if (!configFilePath) {
		throw new Error('Prettier config could not be found');
	}

	const prettierConfig = await resolveConfig(configFilePath);
	if (!prettierConfig) {
		throw new Error(`Prettier config at ${configFilePath} could not be read`);
	}

	return format(input, {
		...prettierConfig,
		filepath: 'test.tsx',
		plugins: [],
		endOfLine: 'lf',
	});
};

export const parseExpression = (code: string): Expression => {
	const ast = parseAst(`a = ${code}`);
	const stmt = ast.program.body[0];
	if (
		stmt.type !== 'ExpressionStatement' ||
		stmt.expression.type !== 'AssignmentExpression'
	) {
		throw new Error('Unexpected AST');
	}

	return stmt.expression.right;
};

export const lineColumnToNodePath = (
	input: string,
	line: number,
): SequenceNodePath => {
	const ast = parseAst(input);
	const result = _lineColumnToNodePath(ast, line);
	if (!result) {
		throw new Error(`No JSX element found at line ${line}`);
	}

	return result;
};

export const lineContainingToNodePath = (
	input: string,
	search: string,
): SequenceNodePath => {
	const sourceLines = input.split('\n');
	const line = sourceLines.findIndex((sourceLine) =>
		sourceLine.includes(search),
	);
	if (line === -1) {
		throw new Error(`Could not find ${JSON.stringify(search)} in source`);
	}

	const ast = parseAst(input);
	const column = sourceLines[line].indexOf(search);
	const result = _lineColumnToNodePath(ast, line + 1, column, input);
	if (!result) {
		throw new Error(`No JSX element found for ${JSON.stringify(search)}`);
	}

	return result;
};
