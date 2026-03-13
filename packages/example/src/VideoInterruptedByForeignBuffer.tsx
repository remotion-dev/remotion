import {Video} from '@remotion/media';
import React, {useEffect} from 'react';
import {Composition, Sequence, useBufferState, useCurrentFrame} from 'remotion';
import {calculateMetadataFn} from './NewVideo';

const src = 'https://remotion.media/video.mp4';

const BUFFER_START_FRAME = 60;
const BUFFER_DURATION_MS = 5000;

const ForeignBufferElement: React.FC = () => {
	const buffer = useBufferState();
	const frame = useCurrentFrame();

	useEffect(() => {
		if (frame === BUFFER_START_FRAME) {
			const handle = buffer.delayPlayback();

			const timeout = setTimeout(() => {
				handle.unblock();
			}, BUFFER_DURATION_MS);

			return () => {
				clearTimeout(timeout);
				handle.unblock();
			};
		}
	}, [buffer, frame]);

	return (
		<div
			style={{
				position: 'absolute',
				top: 20,
				left: 20,
				background: frame >= BUFFER_START_FRAME ? 'red' : 'green',
				color: 'white',
				padding: '8px 16px',
				fontFamily: 'sans-serif',
				fontSize: 14,
				borderRadius: 4,
				zIndex: 1000,
			}}
		>
			{frame >= BUFFER_START_FRAME
				? `Buffering (triggered at frame ${BUFFER_START_FRAME})...`
				: `Will buffer at frame ${BUFFER_START_FRAME} (current: ${frame})`}
		</div>
	);
};

const NewVideoBufferStateComponent: React.FC = () => {
	return (
		<>
			<Video src={src} />
			<Sequence>
				<ForeignBufferElement />
			</Sequence>
		</>
	);
};

export const NewVideoBufferStateComp: React.FC = () => {
	return (
		<Composition
			component={NewVideoBufferStateComponent}
			id="VideoInterruptedByForeignBuffer"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};
