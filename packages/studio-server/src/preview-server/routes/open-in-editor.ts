import fs from 'node:fs';
import path from 'node:path';
import type {
	OpenInEditorRequest,
	OpenInEditorResponse,
} from '@remotion/studio-shared';
import {
	getDisplayNameForEditor,
	guessEditor,
	launchEditor,
} from '../../helpers/open-in-editor';
import type {ApiHandler} from '../api-types';

const editorGuess = guessEditor();

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

export const getEditorName = async () => {
	const [edit] = await editorGuess;
	return getDisplayNameForEditor(edit ? edit.command : null);
};

export const openInEditorHandler: ApiHandler<
	OpenInEditorRequest,
	OpenInEditorResponse
> = async ({input, remotionRoot, logLevel}) => {
	try {
		if (!('stack' in input)) {
			throw new TypeError('Need to pass stack');
		}

		const {stack, search} = input;
		const fileName = path.resolve(
			remotionRoot,
			stack.originalFileName as string,
		);
		const originalLineNumber = stack.originalLineNumber as number;
		const originalColumnNumber = stack.originalColumnNumber as number;
		const position =
			search === null
				? {
						lineNumber: originalLineNumber,
						columnNumber: originalColumnNumber,
					}
				: findSearchPosition({
						contents: await fs.promises.readFile(fileName, 'utf-8'),
						lineNumber: originalLineNumber,
						columnNumber: originalColumnNumber,
						search,
					});
		const guess = await editorGuess;
		const didOpen = await launchEditor({
			colNumber: position.columnNumber,
			editor: guess[0],
			fileName,
			lineNumber: position.lineNumber,
			vsCodeNewWindow: false,
			logLevel,
		});

		return {
			success: didOpen,
		};
	} catch {
		return {
			success: false,
		};
	}
};
