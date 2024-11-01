import {Player} from '@remotion/player';
import React, {useCallback, useRef, useState} from 'react';
import {AbsoluteFill, OffthreadVideo, useVideoConfig} from 'remotion';

export const Greenscreen: React.FC<{
	readonly opacity: number;
}> = ({opacity}) => {
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

			context.drawImage(frame, 0, 0, width, height);
			const imageFrame = context.getImageData(0, 0, width, height);
			const {length} = imageFrame.data;

			for (let i = 0; i < length; i += 4) {
				const red = imageFrame.data[i + 0];
				const green = imageFrame.data[i + 1];
				const blue = imageFrame.data[i + 2];
				if (green > 100 && red < 100 && blue < 100) {
					imageFrame.data[i + 3] = opacity * 255;
				}
			}

			context.putImageData(imageFrame, 0, 0);
		},
		[height, opacity, width],
	);

	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<OffthreadVideo
					style={{opacity: 0}}
					onVideoFrame={onVideoFrame}
					src="https://remotion-assets.s3.eu-central-1.amazonaws.com/just-do-it-short.mp4"
				/>
			</AbsoluteFill>
			<AbsoluteFill>
				<canvas ref={canvas} width={width} height={height} />
			</AbsoluteFill>
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
					startFrom={300}
					src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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
	const [effect, setEffect] = useState(0);
	return (
		<div>
			<Player
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
					opacity: 1 - effect,
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
						Slide to adjust transparency:
						<input
							onChange={(e) => setEffect(Number(e.target.value))}
							type="range"
							min={0}
							max={1}
							step={1 / 255}
							value={effect}
							style={{marginLeft: 10}}
						/>
					</div>
				</>
			) : null}
		</div>
	);
};
