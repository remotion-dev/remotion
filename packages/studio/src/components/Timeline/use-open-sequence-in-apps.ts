import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	openInCodingAgent as launchCodingAgent,
	openOriginalPositionInEditor,
} from '../../helpers/open-in-editor';
import {showNotification} from '../Notifications/NotificationCenter';
import {
	canUseEditorPicker,
	getPreferredEditorId,
	useDefaultCodingAgentInfo,
	useDefaultEditorInfo,
} from '../use-default-editor-info';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';

export const useOpenSequenceInApps = (sequence: TSequence) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const {resolvedLocation: originalLocation} = useResolveStackAndReactToChange(
		sequence.getStack,
		sequence.controls?.overrideId ?? sequence.id,
	);
	const editorPickerAvailable = canUseEditorPicker(previewConnected);
	const editorInfo = useDefaultEditorInfo(editorPickerAvailable);
	const codingAgentInfo = useDefaultCodingAgentInfo(editorPickerAvailable);
	const preferredEditorId = getPreferredEditorId(editorInfo);
	const canOpenInEditor = useMemo(
		() =>
			Boolean(
				previewConnected &&
				originalLocation &&
				(window.remotion_editorName !== null || preferredEditorId !== null),
			),
		[originalLocation, preferredEditorId, previewConnected],
	);

	const openInEditor = useCallback(
		async (editorId: EditorPickerId | null) => {
			if (!canOpenInEditor || !originalLocation) {
				return;
			}

			try {
				await openOriginalPositionInEditor(
					originalLocation,
					editorId ??
						(window.remotion_editorName === null ? preferredEditorId : null),
				);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		},
		[canOpenInEditor, originalLocation, preferredEditorId],
	);
	const openInCodingAgent = useCallback(
		async (
			codingAgentId: DefaultCodingAgent,
			codingAgentName: string,
			contextForAgents: string | null,
		) => {
			try {
				const response = await launchCodingAgent(
					codingAgentId,
					contextForAgents,
				);
				if (!response.success) {
					showNotification(`Could not open ${codingAgentName}`, 2000);
				}
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		},
		[],
	);

	return {
		canOpenInEditor,
		canConfigureApps: editorPickerAvailable,
		codingAgentInfo,
		editorInfo,
		openInCodingAgent,
		openInEditor,
		originalLocation,
	};
};
