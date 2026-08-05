import type {
	EditorPickerId,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {useSettings} from './SettingsContext';

export const canUseEditorPicker = (previewServerConnected: boolean) => {
	return (
		previewServerConnected &&
		!window.remotion_isReadOnlyStudio &&
		getBrowserStudioOperations() === null
	);
};

export const getPreferredEditorId = (
	editorInfo: GetDefaultEditorInfoResponse | null,
): EditorPickerId | null => {
	return (
		editorInfo?.installedEditors.find(
			(editor) => editor.name === window.remotion_editorName,
		)?.id ?? null
	);
};

export const useDefaultEditorInfo = (enabled: boolean) => {
	const {editorInfo} = useSettings();
	return enabled ? editorInfo : null;
};

export const useDefaultCodingAgentInfo = (enabled: boolean) => {
	const {codingAgentInfo} = useSettings();
	return enabled ? codingAgentInfo : null;
};
