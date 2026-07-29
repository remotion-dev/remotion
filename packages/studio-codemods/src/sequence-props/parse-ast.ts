import type {File} from '@babel/types';
import * as recast from 'recast';
import * as tsParser from 'recast/parsers/babel-ts';

const normalizeImportSpacing = (input: string) =>
	input.replace(/(import[^\n]*\n)\n+(?=import\b)/g, '$1');

export const parseAst = (input: string) => {
	return recast.parse(input, {
		parser: tsParser,
	}) as File;
};

export const serializeAst = (ast: File) => {
	const raw = recast.print(ast, {
		parser: tsParser,
	}).code;
	return normalizeImportSpacing(raw.replace(/\r\n/g, '\n'));
};
