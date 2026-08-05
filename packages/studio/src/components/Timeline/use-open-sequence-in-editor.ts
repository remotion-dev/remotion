import type {EditorPickerId} from '@remotion/studio-shared';
import {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {openOriginalPositionInEditor} from '../../helpers/open-in-editor';
import {showNotification} from '../Notifications/NotificationCenter';
import {
	canUseEditorPicker,
	useDefaultEditorInfo,
} from '../use-default-editor-info';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';

export const useOpenSequenceInEditor = (sequence: TSequence) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const originalLocation = useResolveStackAndReactToChange(sequence.getStack);
	const editorInfo = useDefaultEditorInfo(canUseEditorPicker(previewConnected));

	const canOpenInEditor = useMemo(
		() =>
			Boolean(
				window.remotion_editorName && previewConnected && originalLocation,
			),
		[originalLocation, previewConnected],
	);

	const openInEditor = useCallback(
		async (editorId: EditorPickerId | null) => {
			if (!canOpenInEditor || !originalLocation) {
				return;
			}

			try {
				await openOriginalPositionInEditor(originalLocation, editorId);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		},
		[canOpenInEditor, originalLocation],
	);

	return {
		canOpenInEditor,
		editorInfo,
		openInEditor,
		originalLocation,
	};
};
