import type React from 'react';
import {useCallback, useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {PreviewServerConnectionCtx} from '../helpers/client-id';
import {useKeybinding} from '../helpers/use-keybinding';
import {sendErrorNotification} from './Notifications/NotificationCenter';

export const TitleUpdater: React.FC = () => {
	const video = Internals.useVideo();

	useEffect(() => {
		if (!video) {
			document.title = 'Remotion Preview';
			return;
		}

		document.title = `${video.id} / ${window.remotion_projectName} - Remotion Preview`;
	}, [video]);

	return null;
};

export const CurrentCompositionKeybindings: React.FC = () => {
	const keybindings = useKeybinding();
	const video = Internals.useVideo();
	const {type} = useContext(PreviewServerConnectionCtx);

	const openRenderModal = useCallback(() => {
		if (!video) {
			return;
		}

		if (type !== 'connected') {
			sendErrorNotification('Preview server is offline');
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
		});

		return () => {
			binding.unregister();
		};
	}, [keybindings, openRenderModal]);

	return null;
};
