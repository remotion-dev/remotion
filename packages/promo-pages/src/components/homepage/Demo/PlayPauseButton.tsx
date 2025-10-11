import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect} from 'react';
import {PALETTE} from '../layout/colors';
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
	color: PALETTE.TEXT_COLOR,
};

export const PlayPauseButton: React.FC<{
	readonly playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	const [playing, setPlaying] = React.useState(true);

	useEffect(() => {
		const {current} = playerRef;
		if (!current) {
			return;
		}

		const onPlay = () => {
			setPlaying(true);
		};

		const onPause = () => {
			setPlaying(false);
		};

		current.addEventListener('play', onPlay);
		current.addEventListener('pause', onPause);

		return () => {
			current.removeEventListener('play', onPlay);
			current.removeEventListener('pause', onPause);
		};
	}, [playerRef]);

	const onToggle = useCallback(() => {
		playerRef.current?.toggle();
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
