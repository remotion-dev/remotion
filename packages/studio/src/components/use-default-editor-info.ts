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

const preferredFallbackEditorIds: EditorPickerId[] = [
	'zed',
	'vscode',
	'cursor',
];

export const getPreferredEditorId = (
	editorInfo: GetDefaultEditorInfoResponse | null,
): EditorPickerId | null => {
	const runningEditorId = editorInfo?.installedEditors.find(
		(editor) => editor.nameWithType === window.remotion_editorName,
	)?.id;
	if (runningEditorId) {
		return runningEditorId;
	}

	if (window.remotion_editorName !== null) {
		return null;
	}

	const configuredEditorId = editorInfo?.installedEditors.find(
		(editor) => editor.id === editorInfo.defaultEditor,
	)?.id;
	if (configuredEditorId) {
		return configuredEditorId;
	}

	return (
		editorInfo?.installedEditors
			.slice()
			.sort((a, b) => {
				const aPriority = preferredFallbackEditorIds.indexOf(a.id);
				const bPriority = preferredFallbackEditorIds.indexOf(b.id);
				const normalizedAPriority =
					aPriority === -1 ? Number.POSITIVE_INFINITY : aPriority;
				const normalizedBPriority =
					bPriority === -1 ? Number.POSITIVE_INFINITY : bPriority;

				if (normalizedAPriority !== normalizedBPriority) {
					return normalizedAPriority - normalizedBPriority;
				}

				return a.nameWithType.localeCompare(b.nameWithType);
			})
			.at(0)?.id ?? null
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
