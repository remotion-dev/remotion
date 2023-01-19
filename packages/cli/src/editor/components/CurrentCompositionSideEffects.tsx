import type React from 'react';
import {useCallback, useEffect} from 'react';
import {Internals} from 'remotion';
import {useKeybinding} from '../helpers/use-keybinding';

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

	const openRenderModal = useCallback(() => {
		if (!video) {
			return null;
		}

		const renderButton = document.getElementById(
			'render-modal-button'
		) as HTMLDivElement;

		renderButton.click();
	}, [video]);

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
