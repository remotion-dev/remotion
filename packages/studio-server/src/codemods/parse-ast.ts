import type {File} from '@babel/types';
import * as recast from 'recast';
import * as tsParser from 'recast/parsers/babel-ts';
import {normalizeImportSpacing} from '../helpers/imports';

export const parseAst = (input: string) => {
	return recast.parse(input, {
		parser: tsParser,
	}) as File;
};

export const serializeAst = (ast: File) => {
	const raw = recast.print(ast, {
		parser: tsParser,
	}).code;
	// Normalize Windows line endings so normalizeImportSpacing regex works
	return normalizeImportSpacing(raw.replace(/\r\n/g, '\n'));
};
