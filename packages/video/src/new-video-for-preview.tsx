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

const SEEK_THRESHOLD = 0.05;

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
	const videoFrameIteratorRef = useRef<AsyncGenerator<
		WrappedCanvas,
		void,
		unknown
	> | null>(null);
	const nextFrameRef = useRef<WrappedCanvas | null>(null);
	const asyncIdRef = useRef<number>(0);
	const lastCurrentTimeRef = useRef<number>(-1);

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
		const currentAsyncId = asyncIdRef.current;
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
			asyncIdRef.current = currentAsyncId + 1; // cancel any pending operations
			videoFrameIteratorRef.current?.return();
			videoFrameIteratorRef.current = null;
			nextFrameRef.current = null;
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

	const isSignificantSeek = useCallback((newTime: number): boolean => {
		if (lastCurrentTimeRef.current === -1) return true;

		const timeDiff = Math.abs(newTime - lastCurrentTimeRef.current);
		return timeDiff > SEEK_THRESHOLD;
	}, []);

	// uses existing iterator
	const updateNextFrame = useCallback(async () => {
		if (!videoFrameIteratorRef.current) return;

		const currentAsyncId = asyncIdRef.current;

		try {
			const result = await videoFrameIteratorRef.current.next();

			if (currentAsyncId !== asyncIdRef.current) {
				Log.trace(
					logLevel,
					`[NewVideoForPreview] Race condition detected, aborting fetch`,
				);
				// race condition detected, just return
				return;
			}

			if (result.value) {
				Log.trace(
					logLevel,
					`[NewVideoForPreview] Buffered next frame ${result.value.timestamp.toFixed(3)}s`,
				);
				nextFrameRef.current = result.value;
			}
		} catch (err) {
			Log.error('[NewVideoForPreview] Failed to update next frame', err);
		}
	}, [logLevel]);

	// frame consumption using existing iterator (like mediabunny render loop)
	const checkAndConsumeFrame = useCallback(() => {
		const nextFrame = nextFrameRef.current;

		if (nextFrame && nextFrame.timestamp <= currentTime) {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Using cached frame ${nextFrame.timestamp.toFixed(3)}s`,
			);
			drawFrame(nextFrame.canvas);
			nextFrameRef.current = null;

			// Continue using SAME iterator for next frame
			updateNextFrame();
			return true;
		}

		return false;
	}, [currentTime, drawFrame, logLevel, updateNextFrame]);

	// resets the current iterator, starts a new one
	const startVideoIterator = useCallback(
		async (timeToSeek: number) => {
			if (!canvasSink) return;

			asyncIdRef.current++;
			const currentAsyncId = asyncIdRef.current;

			// clean up previous iterator
			await videoFrameIteratorRef.current?.return();

			videoFrameIteratorRef.current = canvasSink.canvases(timeToSeek);

			try {
				const firstFrame =
					(await videoFrameIteratorRef.current.next()).value ?? null;
				const secondFrame =
					(await videoFrameIteratorRef.current.next()).value ?? null;

				if (currentAsyncId !== asyncIdRef.current) {
					Log.trace(
						logLevel,
						`[NewVideoForPreview] Race condition detected, aborting fetch for ${timeToSeek.toFixed(3)}s`,
					);
					return;
				}

				if (firstFrame) {
					Log.trace(
						logLevel,
						`[NewVideoForPreview] Drew initial frame ${firstFrame.timestamp.toFixed(3)}s`,
					);
					drawFrame(firstFrame.canvas);
				}

				nextFrameRef.current = secondFrame;

				if (secondFrame) {
					updateNextFrame();
				}
			} catch (err) {
				Log.error('[NewVideoForPreview] Failed to start video iterator', err);
			}
		},
		[canvasSink, drawFrame, logLevel, updateNextFrame],
	);

	// main sync effect - mediabunny player example insipired
	useEffect(() => {
		if (!canvasSink) return;

		const isSeek = isSignificantSeek(currentTime);

		if (isSeek) {
			Log.trace(
				logLevel,
				`[NewVideoForPreview] Seek detected to ${currentTime.toFixed(3)}s, creating new iterator`,
			);
			startVideoIterator(currentTime);
		} else {
			const frameConsumed = checkAndConsumeFrame();

			if (!frameConsumed && !nextFrameRef.current) {
				Log.trace(
					logLevel,
					`[NewVideoForPreview] No cached frame, fetching for ${currentTime.toFixed(3)}s`,
				);
				startVideoIterator(currentTime);
			}
		}

		lastCurrentTimeRef.current = currentTime;
	}, [
		canvasSink,
		currentTime,
		isSignificantSeek,
		checkAndConsumeFrame,
		startVideoIterator,
		logLevel,
	]);

	return (
		<canvas
			ref={canvasRef}
			width={videoConfig.width}
			height={videoConfig.height}
			style={style}
		/>
	);
};
