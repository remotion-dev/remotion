import React, {useCallback, useEffect, useRef} from 'react';
import {AbsoluteFill, Video, useVideoConfig} from 'remotion';

export const VideoOnCanvas: React.FC = () => {
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

		context.filter = 'grayscale(100%)';
		context.drawImage(video.current, 0, 0, width, height);
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
					src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
				/>
			</AbsoluteFill>
			<AbsoluteFill>
				<canvas ref={canvas} width={width} height={height} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
