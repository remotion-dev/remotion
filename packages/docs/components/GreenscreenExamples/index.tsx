import {Player} from '@remotion/player';
import React, {useCallback, useRef} from 'react';
import {AbsoluteFill, OffthreadVideo, useVideoConfig} from 'remotion';

export const VideoOnCanvas: React.FC = () => {
	const canvas = useRef<HTMLCanvasElement>(null);
	const {width, height} = useVideoConfig();

	const onVideoFrame = useCallback(
		(frame: CanvasImageSource) => {
			if (!canvas.current) {
				return;
			}

			const context = canvas.current.getContext('2d');

			if (!context) {
				return;
			}

			context.filter = 'grayscale(100%)';
			context.drawImage(frame, 0, 0, width, height);
		},
		[height, width],
	);

	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<OffthreadVideo
					onVideoFrame={onVideoFrame}
					style={{opacity: 0}}
					trimBefore={300}
					src="https://remotion.media/BigBuckBunny.mp4"
				/>
			</AbsoluteFill>
			<AbsoluteFill>
				<canvas ref={canvas} width={width} height={height} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const VideoCanvasExamples: React.FC = () => {
	return (
		<div>
			<Player
				acknowledgeRemotionLicense
				component={VideoOnCanvas}
				compositionWidth={1280}
				compositionHeight={720}
				controls
				durationInFrames={150}
				doubleClickToFullscreen
				fps={30}
				style={{
					width: '100%',
				}}
				loop
			/>
		</div>
	);
};
