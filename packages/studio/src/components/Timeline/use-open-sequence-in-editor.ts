import {useCallback, useContext, useMemo} from 'react';
import type {TSequence} from 'remotion';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {openOriginalPositionInEditor} from '../../helpers/open-in-editor';
import {showNotification} from '../Notifications/NotificationCenter';
import {useResolveStackAndReactToChange} from './use-resolved-stack-react-to-change';

export const useOpenSequenceInEditor = (sequence: TSequence | null) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const previewConnected = previewServerState.type === 'connected';
	const getStack = useCallback(() => sequence?.getStack() ?? null, [sequence]);
	const originalLocation = useResolveStackAndReactToChange(getStack);

	const canOpenInEditor = useMemo(
		() =>
			Boolean(
				window.remotion_editorName && previewConnected && originalLocation,
			),
		[originalLocation, previewConnected],
	);

	const openInEditor = useCallback(async () => {
		if (!canOpenInEditor || !originalLocation) {
			return;
		}

		try {
			await openOriginalPositionInEditor(originalLocation);
		} catch (err) {
			showNotification((err as Error).message, 2000);
		}
	}, [canOpenInEditor, originalLocation]);

	return {
		canOpenInEditor,
		openInEditor,
		originalLocation,
	};
};
