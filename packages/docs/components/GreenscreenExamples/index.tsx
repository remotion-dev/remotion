import {colorKey} from '@remotion/effects/color-key';
import {Video} from '@remotion/media';
import {Player} from '@remotion/player';
import React, {useCallback, useRef, useState} from 'react';
import {AbsoluteFill, OffthreadVideo, useVideoConfig} from 'remotion';

export const Greenscreen: React.FC<{
	readonly similarity: number;
}> = ({similarity}) => {
	return (
		<AbsoluteFill>
			<Video
				src="https://remotion.media/greenscreen.mp4"
				effects={[
					colorKey({
						similarity,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

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

export const VideoCanvasExamples: React.FC<{
	readonly type: 'base' | 'greenscreen';
}> = ({type}) => {
	const component = (() => {
		if (type === 'greenscreen') {
			return Greenscreen;
		}

		return VideoOnCanvas;
	})();
	const [similarity, setSimilarity] = useState(0.37);
	return (
		<div>
			<Player
				acknowledgeRemotionLicense
				component={component}
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
				inputProps={{
					similarity,
				}}
			/>
			{type === 'greenscreen' ? (
				<>
					<br />
					<div
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							display: 'flex',
						}}
					>
						Slide to adjust similarity:
						<input
							onChange={(e) => setSimilarity(Number(e.target.value))}
							type="range"
							min={0.1}
							max={1}
							step={1 / 255}
							value={similarity}
							style={{marginLeft: 10}}
						/>
					</div>
				</>
			) : null}
		</div>
	);
};
