import type {SequenceNodePath} from 'remotion';
import {getNodes} from '../get-nodes';
import {lineColumnToNodePath as _lineColumnToNodePath} from '../sequence-props';
import {parseAst} from '../sequence-props/parse-ast';

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

	const column = sourceLines[line].indexOf(search);
	const result = getNodes({
		project: {rootDir: '/', files: {'/test.tsx': input}},
		filePath: '/test.tsx',
	}).findLast(
		(node) =>
			node.location?.line === line + 1 && node.location.column <= column,
	)?.nodePath;
	if (!result) {
		throw new Error(`No JSX element found for ${JSON.stringify(search)}`);
	}

	return result;
};
