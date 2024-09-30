import type {PlayerRef} from '@remotion/player';
import React, {useEffect} from 'react';
import styles from './player.module.css';
import {PlayerFullscreen} from './PlayerFullscreen';
import {PlayerSeekBar} from './PlayerSeekBar';
import {PlayerVolume} from './PlayerVolume';
import {PlayPauseButton} from './PlayPauseButton';

const formatTime = (timeInSeconds: number) => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.floor(timeInSeconds - minutes * 60);
	return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
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

export const PlayerControls: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
	durationInFrames: number;
	fps: number;
}> = ({playerRef, durationInFrames, fps}) => {
	return (
		<div className={styles['controls-wrapper']}>
			<div className={styles['start-controls']}>
				<PlayPauseButton playerRef={playerRef} />
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
			<div className={styles['end-controls']}>
				<PlayerVolume playerRef={playerRef} />
				<PlayerFullscreen playerRef={playerRef} />
			</div>
		</div>
	);
};
