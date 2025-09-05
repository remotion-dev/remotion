import React, {useEffect, useRef} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {extractFrameForPreview} from './extract-frame-for-preview';
import type {LogLevel} from './log';

const {useUnsafeVideoConfig} = Internals;

type NewVideoForPreviewProps = {
	readonly src: string;
	readonly style?: React.CSSProperties;
	readonly playbackRate?: number;
	readonly logLevel?: LogLevel;
};

export const NewVideoForPreview: React.FC<NewVideoForPreviewProps> = ({
	src,
	style,
	playbackRate = 1,
	logLevel = 'info',
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoConfig = useUnsafeVideoConfig();
	const frame = useCurrentFrame();

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideoForPreview>.');
	}

	useEffect(() => {
		if (!canvasRef.current) {
			return;
		}

		const {fps} = videoConfig;
		const actualFps = fps / playbackRate;
		const timestamp = frame / actualFps;

		extractFrameForPreview({
			src,
			timestamp,
			logLevel,
		})
			.then((imageBitmap) => {
				if (!imageBitmap) {
					return;
				}

				if (!canvasRef.current) {
					return;
				}

				const ctx = canvasRef.current.getContext('2d');

				if (!ctx) {
					return;
				}

				ctx.clearRect(0, 0, videoConfig.width, videoConfig.height);
				ctx.drawImage(imageBitmap, 0, 0);

				imageBitmap.close();
			})
			.catch(() => {
				// TODO: report errors via logger
			});
	}, [src, frame, playbackRate, videoConfig, logLevel]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
			style={style}
		/>
	);
};
