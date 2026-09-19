import fs from 'node:fs';
import path from 'node:path';
import {CodemodInternals} from '@remotion/codemods';
import type {
	FindInFileRequest,
	FindInFileResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

export const {findSearchPosition} = CodemodInternals;

export const findInFileHandler: ApiHandler<
	FindInFileRequest,
	FindInFileResponse
> = async ({input, remotionRoot}) => {
	const {fileName, lineNumber, columnNumber, search} = input;
	const contents = await fs.promises.readFile(
		path.resolve(remotionRoot, fileName),
		'utf-8',
	);

	return findSearchPosition({
		contents,
		lineNumber,
		columnNumber,
		search,
	});
};
