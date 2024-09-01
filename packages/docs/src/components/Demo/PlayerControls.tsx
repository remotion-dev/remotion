import type {PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect} from 'react';
import {PlayerFullscreen} from './PlayerFullscreen';
import {PlayerSeekBar} from './PlayerSeekBar';

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

	return (
		<button type="button" onClick={onToggle}>
			{playing ? '❚❚' : '▶'}
		</button>
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
		<div>
			{formatTime(time / fps)} / {formatTime(durationInFrames / fps)}
		</div>
	);
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

export const PlayerControls: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
	durationInFrames: number;
	fps: number;
}> = ({playerRef, durationInFrames, fps}) => {
	return (
		<div style={row}>
			<PlayButton playerRef={playerRef} />
			<TimeDisplay
				playerRef={playerRef}
				durationInFrames={durationInFrames}
				fps={fps}
			/>
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
			<PlayerFullscreen playerRef={playerRef} />
		</div>
	);
};
