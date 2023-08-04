import type React from 'react';
import {useCallback, useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {setCurrentVideoId} from '../helpers/docuement-title';
import {useKeybinding} from '../helpers/use-keybinding';
import {sendErrorNotification} from './Notifications/NotificationCenter';

export const TitleUpdater: React.FC = () => {
	const video = Internals.useVideo();

	useEffect(() => {
		setCurrentVideoId(video?.id ?? null);
	}, [video]);

	return null;
};

export const CurrentCompositionKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const video = Internals.useVideo();
	const {type} = useContext(StudioServerConnectionCtx);

	const openRenderModal = useCallback(() => {
		if (!video) {
			return;
		}

		if (type !== 'connected') {
			sendErrorNotification('Studio server is offline');
			return;
		}

		const renderButton = document.getElementById(
			'render-modal-button'
		) as HTMLDivElement;

		renderButton.click();
	}, [type, video]);

	useEffect(() => {
		const binding = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'r',
			commandCtrlKey: false,
			callback: openRenderModal,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, openRenderModal]);

	return null;
};
