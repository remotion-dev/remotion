import path from 'node:path';
import type {DefaultEditor, LogLevel} from '@remotion/renderer';
import type {
	OpenInEditorRequest,
	OpenInEditorResponse,
} from '@remotion/studio-shared';
import {launchEditor} from '../../helpers/open-in-editor';
import {resolveEditor} from '../../helpers/resolve-editor';
import type {ApiHandler} from '../api-types';

export const getEditorName = async ({
	getDefaultEditor,
	logLevel,
}: {
	getDefaultEditor: () => DefaultEditor | null;
	logLevel: LogLevel;
}) => {
	const editor = await resolveEditor({
		defaultEditor: getDefaultEditor(),
		logLevel,
	});
	return editor?.name ?? null;
};

export const openInEditorHandler: ApiHandler<
	OpenInEditorRequest,
	OpenInEditorResponse
> = async ({input, remotionRoot, logLevel, getDefaultEditor}) => {
	try {
		if (!('stack' in input)) {
			throw new TypeError('Need to pass stack');
		}

		const {stack} = input;
		const editor = await resolveEditor({
			defaultEditor: getDefaultEditor(),
			logLevel,
		});
		if (!editor) {
			return {success: false};
		}

		const didOpen = await launchEditor({
			colNumber: stack.originalColumnNumber as number,
			editor,
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
