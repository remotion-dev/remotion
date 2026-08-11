import {Video} from '@remotion/media';
import React, {useEffect} from 'react';
import {AbsoluteFill, Composition, Sequence, useBufferState} from 'remotion';
import {calculateMetadataFn} from './NewVideo';

const src = 'https://remotion.media/video.mp4';

const BUFFER_START_FRAME = 60;
const BUFFER_DURATION_MS = 3000;

const Interrupter: React.FC = () => {
	const buffer = useBufferState();

	useEffect(() => {
		const delayHandle = buffer.delayPlayback();
		const timeout = setTimeout(() => {
			delayHandle.unblock();
		}, BUFFER_DURATION_MS);

		return () => {
			clearTimeout(timeout);
			delayHandle.unblock();
		};
	}, [buffer]);

	return (
		<AbsoluteFill
			style={{
				background: 'rgba(255, 0, 0, 0.4)',
				display: 'flex',
				alignItems: 'flex-start',
				justifyContent: 'flex-start',
				padding: 20,
			}}
		>
			<div
				style={{
					background: 'red',
					color: 'white',
					padding: '8px 16px',
					fontFamily: 'sans-serif',
					fontSize: 24,
					borderRadius: 4,
				}}
			>
				Buffering for {BUFFER_DURATION_MS}ms (triggered at frame{' '}
				{BUFFER_START_FRAME})
			</div>
		</AbsoluteFill>
	);
};

const Component: React.FC = () => {
	return (
		<>
			<Video src={src} />
			<Sequence from={BUFFER_START_FRAME} layout="none">
				<Interrupter />
			</Sequence>
		</>
	);
};

export const AudioSmoothnessBufferInterruptionComp: React.FC = () => {
	return (
		<Composition
			component={Component}
			id="audio-smoothness-buffer-interruption"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};
