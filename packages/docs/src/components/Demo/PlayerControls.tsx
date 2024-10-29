import type {PlayerRef} from '@remotion/player';
import React from 'react';
import {BOX_STROKE} from '../../../components/layout/colors';
import styles from './player.module.css';
import {PlayerFullscreen} from './PlayerFullscreen';
import {PlayerSeekBar} from './PlayerSeekBar';
import {PlayerVolume} from './PlayerVolume';
import {PlayPauseButton} from './PlayPauseButton';
import {TimeDisplay} from './TimeDisplay';

const Separator: React.FC = () => {
	return (
		<div
			style={{
				borderRight: `3px solid ${BOX_STROKE}`,
				height: 50,
			}}
		/>
	);
};

export const PlayerControls: React.FC<{
	readonly playerRef: React.RefObject<PlayerRef>;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly setmountPlayerAudio: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({playerRef, durationInFrames, fps, setmountPlayerAudio}) => {
	return (
		<div className={styles['controls-wrapper']}>
			<div className={styles['start-controls']}>
				<PlayPauseButton playerRef={playerRef} />
				<Separator />
				<PlayerVolume
					playerRef={playerRef}
					setmountPlayerAudio={setmountPlayerAudio}
				/>
				<Separator />
				<div style={{width: 15}} />
				<TimeDisplay playerRef={playerRef} fps={fps} />
				<div style={{width: 15}} />
				<PlayerSeekBar
					durationInFrames={durationInFrames}
					playerRef={playerRef}
					inFrame={null}
					outFrame={null}
					onSeekEnd={() => undefined}
					onSeekStart={() => undefined}
				/>
				<div style={{width: 20}} />
			</div>
			<div className={styles['end-controls']}>
				<Separator />
				<PlayerFullscreen playerRef={playerRef} />
			</div>
		</div>
	);
};
