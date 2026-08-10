import type {Expression} from '@babel/types';
import type {SequenceNodePath} from 'remotion';
import {formatFileContent} from '../codemods/format-file-content';
import {parseAst} from '../codemods/parse-ast';
import {lineColumnToNodePath as _lineColumnToNodePath} from '../preview-server/routes/can-update-sequence-props';

export const prettify = async (input: string): Promise<string> => {
	const {output, formatted} = await formatFileContent({input});
	if (!formatted) {
		throw new Error('prettier could not format input');
	}

	return output;
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
	const line = input
		.split('\n')
		.findIndex((sourceLine) => sourceLine.includes(search));
	if (line === -1) {
		throw new Error(`Could not find ${JSON.stringify(search)} in source`);
	}

	return lineColumnToNodePath(input, line + 1);
};
