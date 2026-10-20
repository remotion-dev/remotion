import fs from 'node:fs';
import {CodemodsInternals} from '@remotion/codemods';
import type {
	FindInFileRequest,
	FindInFileResponse,
} from '@remotion/studio-shared';
import {resolveFileInsideProject} from '../../helpers/resolve-file-inside-project';
import type {ApiHandler} from '../api-types';

export const {findSearchPosition} = CodemodsInternals;

export const findInFileHandler: ApiHandler<
	FindInFileRequest,
	FindInFileResponse
> = async ({input, remotionRoot}) => {
	const {fileName, lineNumber, columnNumber, search} = input;
	const {absolutePath} = resolveFileInsideProject({
		remotionRoot,
		fileName,
		action: 'read',
	});
	const contents = await fs.promises.readFile(absolutePath, 'utf-8');

	return findSearchPosition({
		contents,
		lineNumber,
		columnNumber,
		search,
	});
};
