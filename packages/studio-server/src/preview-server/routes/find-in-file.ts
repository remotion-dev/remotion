import fs from 'node:fs';
import path from 'node:path';
import type {
	FindInFileRequest,
	FindInFileResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';

export const findSearchPosition = ({
	contents,
	lineNumber,
	columnNumber,
	search,
}: {
	contents: string;
	lineNumber: number;
	columnNumber: number;
	search: string;
}) => {
	const lines = contents.split(/\r?\n/);
	const startLineIndex = Math.max(0, lineNumber - 1);

	for (let lineIndex = startLineIndex; lineIndex < lines.length; lineIndex++) {
		const startColumnIndex =
			lineIndex === startLineIndex ? Math.max(0, columnNumber - 1) : 0;
		const foundColumnIndex = lines[lineIndex].indexOf(search, startColumnIndex);

		if (foundColumnIndex !== -1) {
			return {
				lineNumber: lineIndex + 1,
				columnNumber: foundColumnIndex + 1,
			};
		}
	}

	return {lineNumber, columnNumber};
};

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
