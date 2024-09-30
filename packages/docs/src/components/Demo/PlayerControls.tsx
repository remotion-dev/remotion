import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect} from 'react';
import {PausedIcon, PlayingIcon} from '../../icons/arrows';
import {PlayerButton} from './PlayerButton';
import {PlayerFullscreen} from './PlayerFullscreen';
import {PlayerSeekBar} from './PlayerSeekBar';
import {PlayerVolume} from './PlayerVolume';

const formatTime = (timeInSeconds: number) => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.floor(timeInSeconds - minutes * 60);
	return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
};

const PlayButton: React.FC<{
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
		<PlayerButton onClick={onToggle}>
			{playing ? (
				<PlayingIcon style={playPauseIconStyle} />
			) : (
				<PausedIcon style={playPauseIconStyle} />
			)}
		</PlayerButton>
	);
};

const TimeDisplay: React.FC<{
	durationInFrames: number;
	fps: number;
	playerRef: React.RefObject<PlayerRef>;
}> = ({durationInFrames, fps, playerRef}) => {
	const [time, setTime] = React.useState(0);

	useEffect(() => {
		const {current} = playerRef;
		if (!current) {
			return;
		}

		const onTimeUpdate = () => {
			setTime(current.getCurrentFrame());
		};

		current.addEventListener('frameupdate', onTimeUpdate);

		return () => {
			current.removeEventListener('frameupdate', onTimeUpdate);
		};
	}, [playerRef]);

	return (
		<div
			style={{
				fontFamily: 'monospace',
				fontSize: '14px',
				display: 'flex',
				gap: '8px',
			}}
		>
			<span>{formatTime(time / fps)}</span>
			<span style={{opacity: 0.6}}>/</span>
			<span style={{opacity: 0.6}}>{formatTime(durationInFrames / fps)}</span>
		</div>
	);
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	marginTop: '1rem',
	padding: '5px 0px',
	borderRadius: '0.5rem',
	gap: '20px',
};

const startControls: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: '10px',
	width: '100%',
};

const endControls: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	gap: '20px',
};

export const PlayerControls: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
	durationInFrames: number;
	fps: number;
}> = ({playerRef, durationInFrames, fps}) => {
	return (
		<div style={row}>
			<div style={startControls}>
				<PlayButton playerRef={playerRef} />
				<div style={{flex: 1}}>
					<PlayerSeekBar
						durationInFrames={durationInFrames}
						playerRef={playerRef}
						inFrame={null}
						outFrame={null}
						onSeekEnd={() => undefined}
						onSeekStart={() => undefined}
					/>
				</div>
				<TimeDisplay
					playerRef={playerRef}
					durationInFrames={durationInFrames}
					fps={fps}
				/>
			</div>
			<div style={endControls}>
				<PlayerVolume playerRef={playerRef} />
				<PlayerFullscreen playerRef={playerRef} />
			</div>
		</div>
	);
};
