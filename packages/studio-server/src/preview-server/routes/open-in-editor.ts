import type {DefaultEditor, LogLevel} from '@remotion/renderer';
import type {
	OpenInEditorRequest,
	OpenInEditorResponse,
} from '@remotion/studio-shared';
import {openInEditor} from '../../helpers/open-in-app';
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
	return editor?.nameWithType ?? null;
};

export const openInEditorHandler: ApiHandler<
	OpenInEditorRequest,
	OpenInEditorResponse
> = openInEditor;
