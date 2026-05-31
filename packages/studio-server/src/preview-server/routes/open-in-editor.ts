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

		const {stack} = input;
		const guess = await editorGuess;
		const didOpen = await launchEditor({
			colNumber: stack.originalColumnNumber as number,
			editor: guess[0],
			fileName: path.resolve(remotionRoot, stack.originalFileName as string),
			lineNumber: stack.originalLineNumber as number,
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
