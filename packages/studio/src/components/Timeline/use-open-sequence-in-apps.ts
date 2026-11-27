import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo} from 'react';
import type {SequencePropsSubscriptionKey, TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {formatContextForAgents} from '../../helpers/format-file-location';
import {
	getDefaultOpenInTarget,
	openGitSource,
} from '../../helpers/get-git-menu-item';
import {
	openInCodingAgent as launchCodingAgent,
	openOriginalPositionInEditor,
} from '../../helpers/open-in-editor';
import {getSourceDoubleClickHandler} from '../get-source-double-click-handler';
import {showNotification} from '../Notifications/NotificationCenter';
import {useSettings} from '../SettingsContext';
import {
	useDefaultCodingAgentInfo,
	useEditorOpening,
} from '../use-default-editor-info';
import {useSequenceSourceLocation} from './use-sequence-source-location';

export const useOpenSequenceInApps = (
	sequence: TSequence,
	nodePath: SequencePropsSubscriptionKey | null,
) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const {location: originalLocation} = useSequenceSourceLocation(
		sequence,
		nodePath,
	);
	const {
		canConfigureApps,
		canOpenInEditor: editorAvailable,
		defaultEditorId,
		editorInfo,
	} = useEditorOpening(previewConnected);
	const codingAgentInfo = useDefaultCodingAgentInfo(canConfigureApps);
	const {doubleClickAction} = useSettings();
	const canOpenInEditor = useMemo(
		() => Boolean(editorAvailable && originalLocation),
		[editorAvailable, originalLocation],
	);
	const defaultOpenInTarget = getDefaultOpenInTarget({canOpenInEditor});
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
	const getSequenceSourceDoubleClickHandler = useCallback(() => {
		if (!originalLocation) {
			return null;
		}

		return getSourceDoubleClickHandler({
			codingAgentInfo,
			doubleClickAction,
			getContextForAgents: () =>
				formatContextForAgents({
					location: originalLocation,
					name:
						sequence.displayName ||
						sequence.controls?.componentName ||
						'Sequence',
					root: window.remotion_cwd,
				}),
			openSource:
				defaultOpenInTarget === 'editor'
					? () => openInEditor(null)
					: defaultOpenInTarget === 'git-source'
						? () => openGitSource({folder: false, location: originalLocation})
						: null,
		});
	}, [
		codingAgentInfo,
		defaultOpenInTarget,
		doubleClickAction,
		openInEditor,
		originalLocation,
		sequence,
	]);
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
		getSequenceSourceDoubleClickHandler,
		canOpenInEditor,
		canConfigureApps,
		codingAgentInfo,
		editorInfo,
		openInCodingAgent,
		openInEditor,
		originalLocation,
	};
};
