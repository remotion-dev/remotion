import type {WrappedCanvas} from 'mediabunny';
import {ALL_FORMATS, CanvasSink, Input, UrlSource} from 'mediabunny';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {Log, type LogLevel} from './log';

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

	const [canvasSink, setCanvasSink] = useState<CanvasSink | null>(null);
	const nextFrameRef = useRef<WrappedCanvas | null>(null);
	const videoFrameIteratorRef = useRef<AsyncGenerator<
		unknown,
		void,
		unknown
	> | null>(null);

	if (!videoConfig) {
		throw new Error('No video config found');
	}

	if (!src) {
		throw new TypeError('No `src` was passed to <NewVideoForPreview>.');
	}

	const actualFps = videoConfig.fps / playbackRate;
	const currentTime = frame / actualFps;

	// set up the canvas sink here
	useEffect(() => {
		const input = new Input({
			formats: ALL_FORMATS,
			source: new UrlSource(src),
		});

		input
			.getPrimaryVideoTrack()
			.then((track) => {
				if (!track) {
					throw new Error(`No video track found for ${src}`);
				}

				const newCanvasSink = new CanvasSink(track, {
					poolSize: 2,
				});

				Log.trace(logLevel, `[NewVideoForPreview] Created canvas sink`);
				setCanvasSink(newCanvasSink);
			})
			.catch((err) => {
				Log.error('[NewVideoForPreview] Failed to set up sink', err);
			});
		return () => {
			videoFrameIteratorRef.current?.return();
			videoFrameIteratorRef.current = null;
		};
	}, [src, logLevel]);

	const drawFrame = useCallback((canvasImageSource: CanvasImageSource) => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		ctx.drawImage(canvasImageSource, 0, 0);
	}, []);

	// main sync with the current time
	useEffect(() => {
		if (!canvasSink) {
			return;
		}

		const nextFrame = nextFrameRef.current;

		if (nextFrame && nextFrame.timestamp <= currentTime) {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Using prefetched frame for ${currentTime.toFixed(3)}s`,
			);
			drawFrame(nextFrame.canvas);

			nextFrameRef.current = null;

			const prefetchIterator = canvasSink.canvases(currentTime);

			const prefetchNextFrame = async () => {
				try {
					await prefetchIterator.next();

					const nextFrameResult = await prefetchIterator.next();

					if (!nextFrameResult.value) {
						return;
					}

					nextFrameRef.current = nextFrameResult.value;
				} catch (err) {
					Log.error('[NewVideoForPreview] Failed to prefetch next frame', err);
				}
			};

			prefetchNextFrame();

			return;
		}

		videoFrameIteratorRef.current?.return();

		const iterator = canvasSink.canvases(currentTime);
		videoFrameIteratorRef.current = iterator;

		const fetchFrames = async () => {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Fetching frames for ${currentTime.toFixed(3)}s`,
			);
			const firstFrame = (await iterator.next()).value ?? null;
			const secondFrame = (await iterator.next()).value ?? null;

			if (firstFrame) {
				Log.trace(
					logLevel,
					`[NewVideoForPreview] Drew fetched frame`,
					firstFrame.timestamp,
				);
				drawFrame(firstFrame.canvas);
			}

			if (secondFrame) {
				Log.trace(
					logLevel,
					`[NewVideoForPreview] Stored next frame for prefetching`,
					secondFrame.timestamp,
				);
				nextFrameRef.current = secondFrame;
			}
		};

		fetchFrames();
	}, [canvasSink, currentTime, drawFrame, logLevel]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
			style={style}
		/>
	);
};
