import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useState} from 'react';

export const PlayerFullscreen: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
}> = ({playerRef}) => {
	const [supportsFullscreen, setSupportsFullscreen] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const {current} = playerRef;

		if (!current) {
			return;
		}

		const onFullscreenChange = () => {
			setIsFullscreen(document.fullscreenElement !== null);
		};

		current.addEventListener('fullscreenchange', onFullscreenChange);

		return () => {
			current.removeEventListener('fullscreenchange', onFullscreenChange);
		};
	}, [playerRef]);

	useEffect(() => {
		// Must be handled client-side to avoid SSR hydration mismatch
		setSupportsFullscreen(
			(typeof document !== 'undefined' &&
				(document.fullscreenEnabled ||
					// @ts-expect-error Types not defined
					document.webkitFullscreenEnabled)) ??
				false,
		);
	}, []);

	const onClick = useCallback(() => {
		if (isFullscreen) {
			playerRef.current.exitFullscreen();
		} else {
			playerRef.current.requestFullscreen();
		}
	}, [isFullscreen, playerRef]);

	if (!supportsFullscreen) {
		return null;
	}

	return (
		<button type="button" onClick={onClick}>
			{isFullscreen ? '✔️' : '❌'}
		</button>
	);
};
