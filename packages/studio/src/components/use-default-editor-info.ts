import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import {preferredFallbackEditorIds} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {getPreferredApp} from '../helpers/get-preferred-app';
import {codingAgentHistory, editorHistory} from '../state/recently-used-apps';
import {useSettings} from './SettingsContext';

export const canUseEditorPicker = (previewServerConnected: boolean) => {
	return (
		previewServerConnected &&
		!window.remotion_isReadOnlyStudio &&
		getBrowserStudioOperations() === null
	);
};

export const canOpenInEditor = (previewServerConnected: boolean) => {
	return previewServerConnected && getBrowserStudioOperations() === null;
};

export const getPreferredEditorId = (
	editorInfo: GetDefaultEditorInfoResponse | null,
): EditorPickerId | null => {
	return (
		getPreferredApp({
			installedApps: editorInfo?.installedEditors ?? [],
			configuredId: editorInfo?.defaultEditor ?? null,
			runningIds:
				editorInfo?.runningEditors ??
				editorInfo?.installedEditors
					.filter(
						(editor) => editor.nameWithType === window.remotion_editorName,
					)
					.map((editor) => editor.id) ??
				[],
			recentlyUsedIds: editorHistory.getRecentlyUsed(),
			fallbackIds: preferredFallbackEditorIds,
		})?.id ?? null
	);
};

export const getPreferredCodingAgent = (
	codingAgentInfo: GetDefaultCodingAgentInfoResponse | null,
) => {
	return getPreferredApp({
		installedApps: codingAgentInfo?.installedCodingAgents ?? [],
		configuredId: codingAgentInfo?.defaultCodingAgent ?? null,
		runningIds: codingAgentInfo?.runningCodingAgents ?? [],
		recentlyUsedIds: codingAgentHistory.getRecentlyUsed(),
		fallbackIds: codingAgentInfo?.installedCodingAgents.map(({id}) => id) ?? [],
	});
};

export const useEditorOpening = (previewServerConnected: boolean) => {
	const editorConnectionAvailable = canOpenInEditor(previewServerConnected);
	const editorInfo = useDefaultEditorInfo(editorConnectionAvailable);
	const defaultEditorId = getPreferredEditorId(editorInfo);
	const defaultEditor = editorInfo?.installedEditors.find(
		(editor) => editor.id === defaultEditorId,
	);

	return {
		canConfigureApps: canUseEditorPicker(previewServerConnected),
		canOpenInEditor: editorConnectionAvailable && defaultEditorId !== null,
		defaultEditorId,
		defaultEditorName: defaultEditor?.nameWithType ?? null,
		editorInfo,
	};
};

export const useDefaultEditorInfo = (enabled: boolean) => {
	const {editorInfo} = useSettings();
	return enabled ? editorInfo : null;
};

export const useDefaultCodingAgentInfo = (enabled: boolean) => {
	const {codingAgentInfo} = useSettings();
	return enabled ? codingAgentInfo : null;
};
