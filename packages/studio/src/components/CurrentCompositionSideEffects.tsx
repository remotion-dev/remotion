import type React from 'react';
import {useCallback, useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	setCurrentCanvasContentId,
	setRenderJobs,
} from '../helpers/document-title';
import {useKeybinding} from '../helpers/use-keybinding';
import {sendErrorNotification} from './Notifications/NotificationCenter';
import {RenderQueueContext} from './RenderQueue/context';

export const TitleUpdater: React.FC = () => {
	const renderQueue = useContext(RenderQueueContext);
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {jobs} = renderQueue;

	useEffect(() => {
		if (!canvasContent) {
			setCurrentCanvasContentId(null);
			return;
		}

		if (canvasContent.type === 'composition') {
			setCurrentCanvasContentId(canvasContent.compositionId);
			return;
		}

		if (canvasContent.type === 'output') {
			setCurrentCanvasContentId(canvasContent.path);
			return;
		}

		setCurrentCanvasContentId(canvasContent.asset);
	}, [canvasContent]);

	useEffect(() => {
		setRenderJobs(jobs);
	}, [jobs]);

	return null;
};

export const CurrentCompositionKeybindings: React.FC<{
	readOnlyStudio: boolean;
}> = ({readOnlyStudio}) => {
	const keybindings = useKeybinding();
	const video = Internals.useVideo();
	const {type} = useContext(StudioServerConnectionCtx).previewServerState;

	const openRenderModal = useCallback(() => {
		if (!video) {
			return;
		}

		if (readOnlyStudio) {
			return sendErrorNotification('Studio is read-only');
		}

		if (type !== 'connected') {
			sendErrorNotification('Studio server is offline');
			return;
		}

		const renderButton = document.getElementById(
			'render-modal-button',
		) as HTMLDivElement;

		renderButton.click();
	}, [readOnlyStudio, type, video]);

	useEffect(() => {
		const binding = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'r',
			commandCtrlKey: false,
			callback: openRenderModal,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, openRenderModal]);

	return null;
};
