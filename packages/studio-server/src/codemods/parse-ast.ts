import type {File} from '@babel/types';
import * as recast from 'recast';
import * as tsParser from 'recast/parsers/babel-ts';

export const parseAst = (input: string) => {
	return recast.parse(input, {
		parser: tsParser,
	}) as File;
};

export const serializeAst = (ast: File) => {
	return recast.print(ast, {
		parser: tsParser,
	}).code;
};
