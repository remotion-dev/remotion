import path from 'node:path';
import {
	defaultEditorIds,
	type BuiltInEditor,
	type DefaultEditor,
	type LogLevel,
} from '@remotion/renderer';
import type {
	OpenInEditorRequest,
	OpenInEditorResponse,
} from '@remotion/studio-shared';
import {launchCustomEditor} from '../../helpers/custom-editor';
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
		preferredEditor: null,
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
		if (
			input.editorId !== null &&
			input.editorId !== 'custom' &&
			!defaultEditorIds.includes(input.editorId as BuiltInEditor)
		) {
			return {success: false};
		}

		const editor = await resolveEditor({
			defaultEditor: getDefaultEditor(),
			logLevel,
			preferredEditor: input.editorId,
		});
		if (!editor) {
			return {success: false};
		}

		const fileName = path.resolve(
			remotionRoot,
			stack.originalFileName as string,
		);
		const didOpen =
			editor.type === 'custom'
				? await launchCustomEditor({
						editor: editor.editor,
						resolvedExecutable: editor,
						targetPath: fileName,
						lineNumber: stack.originalLineNumber as number,
						columnNumber: stack.originalColumnNumber as number,
						logLevel,
						spawnProcess: null,
					})
				: await launchEditor({
						colNumber: stack.originalColumnNumber as number,
						editor,
						fileName,
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
