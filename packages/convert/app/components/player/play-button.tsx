import type MediaFox from '@mediafox/core';
import React, {useCallback, useEffect} from 'react';
import {PausedIcon, PlayingIcon} from './icons';

const playerButtonStyle: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	borderRadius: 0,
	background: 'none',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	paddingRight: 20,
	paddingLeft: 20,
	cursor: 'pointer',
	height: 50,
	color: 'black',
};

export const PlayPauseButton: React.FC<{
	readonly playerRef: MediaFox;
}> = ({playerRef}) => {
	const [playing, setPlaying] = React.useState(!playerRef.paused);

	useEffect(() => {
		const onPlay = () => {
			setPlaying(true);
		};

		const onPause = () => {
			setPlaying(false);
		};

		playerRef.on('play', onPlay);
		playerRef.on('pause', onPause);

		return () => {
			playerRef.off('play', onPlay);
			playerRef.off('pause', onPause);
		};
	}, [playerRef]);

	const onToggle = useCallback(() => {
		if (playerRef.paused) {
			playerRef.play();
		} else {
			playerRef.pause();
		}
	}, [playerRef]);

	const playPauseIconStyle: React.CSSProperties = {
		width: 15,
	};

	return (
		<button type="button" style={playerButtonStyle} onClick={onToggle}>
			{playing ? (
				<PlayingIcon style={playPauseIconStyle} />
			) : (
				<PausedIcon style={playPauseIconStyle} />
			)}
		</button>
	);
};
