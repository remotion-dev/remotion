import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	getDefaultOpenInTarget,
	openGitSource,
} from '../../helpers/get-git-menu-item';
import {
	openInCodingAgent as launchCodingAgent,
	openOriginalPositionInEditor,
} from '../../helpers/open-in-editor';
import {showNotification} from '../Notifications/NotificationCenter';
import {
	useDefaultCodingAgentInfo,
	useEditorOpening,
} from '../use-default-editor-info';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';

export const useOpenSequenceInApps = (sequence: TSequence) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const {resolvedLocation: originalLocation} = useResolveStackAndReactToChange(
		sequence.getStack,
		sequence.controls?.overrideId ?? sequence.id,
	);
	const {
		canConfigureApps,
		canOpenInEditor: editorAvailable,
		defaultEditorId,
		editorInfo,
	} = useEditorOpening(previewConnected);
	const codingAgentInfo = useDefaultCodingAgentInfo(canConfigureApps);
	const canOpenInEditor = useMemo(
		() => Boolean(editorAvailable && originalLocation),
		[editorAvailable, originalLocation],
	);
	const defaultOpenInTarget = getDefaultOpenInTarget({canOpenInEditor});
	const canOpenSource =
		defaultOpenInTarget !== null && originalLocation !== null;

	const openInEditor = useCallback(
		async (editorId: EditorPickerId | null) => {
			const resolvedEditorId = editorId ?? defaultEditorId;
			if (!canOpenInEditor || !originalLocation || !resolvedEditorId) {
				return;
			}

			try {
				await openOriginalPositionInEditor(originalLocation, resolvedEditorId);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		},
		[canOpenInEditor, defaultEditorId, originalLocation],
	);
	const openSource = useCallback(() => {
		if (!originalLocation) {
			return;
		}

		if (defaultOpenInTarget === 'editor') {
			openInEditor(null);
			return;
		}

		if (defaultOpenInTarget === 'git-source') {
			openGitSource({folder: false, location: originalLocation});
		}
	}, [defaultOpenInTarget, openInEditor, originalLocation]);
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
		canOpenSource,
		canOpenInEditor,
		canConfigureApps,
		codingAgentInfo,
		editorInfo,
		openInCodingAgent,
		openInEditor,
		openSource,
		originalLocation,
	};
};
