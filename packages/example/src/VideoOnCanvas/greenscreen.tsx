import {useVideoConfig, Video} from 'remotion';
import {useCallback, useEffect, useRef} from 'react';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const Greenscreen: React.FC = () => {
	const video = useRef<HTMLVideoElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const {width, height} = useVideoConfig();

	const onVideoFrame = useCallback(() => {
		if (
			!canvas.current ||
			!video.current ||
			!video.current.requestVideoFrameCallback
		) {
			return;
		}

		const context = canvas.current.getContext('2d');

		if (!context) {
			return;
		}

		context.drawImage(video.current, 0, 0, width, height);
		const imageFrame = context.getImageData(0, 0, width, height);
		const {length} = imageFrame.data;

		for (let i = 0; i < length; i += 4) {
			const red = imageFrame.data[i + 0];
			const green = imageFrame.data[i + 1];
			const blue = imageFrame.data[i + 2];
			if (green > 100 && red < 100 && blue < 100) {
				imageFrame.data[i + 3] = 0;
			}
		}

		context.putImageData(imageFrame, 0, 0);

		video.current.requestVideoFrameCallback(() => onVideoFrame());
	}, [height, width]);

	useEffect(() => {
		if (!video.current || !video.current.requestVideoFrameCallback) {
			return;
		}

		video.current.requestVideoFrameCallback(() => onVideoFrame());
	}, [onVideoFrame]);

	return (
		<AbsoluteFill>
			<AbsoluteFill>
				<Video
					ref={video}
					style={{opacity: 0}}
					startFrom={300}
					crossOrigin="anonymous"
					src="https://remotion-assets.s3.eu-central-1.amazonaws.com/just-do-it.mp4"
				/>
			</AbsoluteFill>
			<AbsoluteFill>
				<canvas ref={canvas} width={width} height={height} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
