import type {PlayerRef} from '@remotion/player';
import React from 'react';
import {PALETTE} from '../layout/colors';
import {PlayerSeekBar} from './PlayerSeekBar';
import {PlayerVolume} from './PlayerVolume';
import {PlayPauseButton} from './PlayPauseButton';
import {TimeDisplay} from './TimeDisplay';

const Separator: React.FC = () => {
	return (
		<div
			style={{
				borderRight: `2px solid ${PALETTE.BOX_STROKE}`,
				height: 50,
			}}
		/>
	);
};

export const PlayerControls: React.FC<{
	readonly playerRef: React.RefObject<PlayerRef | null>;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly children: React.ReactNode;
}> = ({playerRef, durationInFrames, fps, children}) => {
	return (
		<div className={'flex flex-row items-center bg-pane'}>
			<PlayPauseButton playerRef={playerRef} />
			<Separator />
			<PlayerVolume playerRef={playerRef} />
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
			<Separator />
			{children}
		</div>
	);
};
