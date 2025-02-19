import {useCallback, useRef} from 'react';
import {
	AbsoluteFill,
	OffthreadVideo,
	staticFile,
	useVideoConfig,
} from 'remotion';

export const OffthreadVideoToCanvas: React.FC = () => {
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

			// If the pixel is very green, reduce the alpha channel
			for (let i = 0; i < length; i += 4) {
				const red = imageFrame.data[i + 0];
				const green = imageFrame.data[i + 1];
				const blue = imageFrame.data[i + 2];

				imageFrame.data[i + 0] = 255 - red;
				imageFrame.data[i + 1] = 255 - green;
				imageFrame.data[i + 2] = 255 - blue;
			}
			context.putImageData(imageFrame, 0, 0);
		},
		[height, width],
	);

	return (
		<AbsoluteFill style={{}}>
			<AbsoluteFill>
				<OffthreadVideo
					muted
					style={{opacity: 0}}
					src={staticFile('vid1.mp4')}
					onVideoFrame={onVideoFrame}
				/>
			</AbsoluteFill>
			<AbsoluteFill>
				<canvas ref={canvas} width={width} height={height} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
