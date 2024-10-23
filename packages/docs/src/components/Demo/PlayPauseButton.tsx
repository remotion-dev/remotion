import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect} from 'react';
import {BlueButton} from '../../../components/layout/Button';
import {PausedIcon, PlayingIcon} from '../../icons/arrows';

const playerButtonStyle: React.CSSProperties = {
	width: '40px',
	height: '40px',
	padding: 0,
};

export const PlayPauseButton: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
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
		<BlueButton
			size="bg"
			fullWidth={false}
			loading={false}
			style={playerButtonStyle}
			onClick={onToggle}
		>
			{playing ? (
				<PlayingIcon style={playPauseIconStyle} />
			) : (
				<PausedIcon style={playPauseIconStyle} />
			)}
		</BlueButton>
	);
};
