import {
	drawBars,
	getLoopDisplayWidth,
	loadWaveformPeaks,
	makeAudioWaveformWorker,
	shouldTileLoopDisplay,
	sliceWaveformPeaks,
	type AudioWaveformWorkerOutgoingMessage,
	type AudioWaveformWorkerRenderMessage,
	type WaveformVolume,
} from '@remotion/timeline-utils';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {Internals} from 'remotion';
import {WHITE_ALPHA_70, WHITE_ALPHA_60} from '../helpers/colors';
import {TIMELINE_BORDER} from '../helpers/timeline-layout';

const EMPTY_PEAKS = new Float32Array(0);

// Recreate the canvas after Fast Refresh because an already transferred canvas
// cannot be handed to OffscreenCanvas again.
const canRetryCanvasTransfer = (err: unknown) => {
	return err instanceof DOMException && err.name === 'InvalidStateError';
};

const canUseAudioWaveformWorker = () => {
	if (
		typeof Worker === 'undefined' ||
		typeof OffscreenCanvas === 'undefined' ||
		typeof HTMLCanvasElement === 'undefined'
	) {
		return false;
	}

	return 'transferControlToOffscreen' in HTMLCanvasElement.prototype;
};

const getContainerStyle = (height: number): React.CSSProperties => {
	return {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
		width: '100%',
		height,
	};
};

const errorMessage: React.CSSProperties = {
	fontSize: 13,
	paddingTop: 6,
	paddingBottom: 6,
	paddingLeft: 12,
	paddingRight: 12,
	alignSelf: 'flex-start',
	maxWidth: 450,
	opacity: 0.75,
};

const getWaveformErrorMessage = () => {
	return new Error(
		'No waveform available. The audio could not be decoded or may not support CORS.',
	);
};

const waveformCanvasStyle: React.CSSProperties = {
	pointerEvents: 'none',
	width: '100%',
	height: '100%',
};

const volumeCanvasStyle: React.CSSProperties = {
	position: 'absolute',
};

const parseVolume = (volume: string | number): WaveformVolume => {
	if (typeof volume === 'number') {
		return volume;
	}

	return volume.split(',').map((v) => Number(v));
};

const drawLoopedWaveform = ({
	canvas,
	peaks,
	volume,
	visualizationWidth,
	loopWidth,
}: {
	canvas: HTMLCanvasElement;
	peaks: Float32Array;
	volume: WaveformVolume;
	visualizationWidth: number;
	loopWidth: number;
}) => {
	const h = canvas.height;
	const w = Math.ceil(visualizationWidth);
	const targetCanvas = document.createElement('canvas');
	targetCanvas.width = Math.max(1, Math.ceil(loopWidth));
	targetCanvas.height = h;

	drawBars({
		canvas: targetCanvas,
		peaks,
		color: WHITE_ALPHA_60,
		volume,
		width: targetCanvas.width,
	});

	canvas.width = w;
	canvas.height = h;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	const pattern = ctx.createPattern(targetCanvas, 'repeat-x');
	if (!pattern) {
		return;
	}

	pattern.setTransform(
		new DOMMatrix().scaleSelf(loopWidth / targetCanvas.width, 1),
	);
	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, w, h);
};

export const AudioWaveform: React.FC<{
	readonly src: string;
	readonly height: number;
	readonly visualizationWidth: number;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly playbackRate: number;
	readonly loopDisplay: LoopDisplay | undefined;
}> = ({
	src,
	height,
	startFrom,
	durationInFrames,
	visualizationWidth,
	volume,
	doesVolumeChange,
	playbackRate,
	loopDisplay,
}) => {
	const [peaks, setPeaks] = useState<Float32Array | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [waveformCanvasKey, setWaveformCanvasKey] = useState(0);
	const canUseWorkerPath = useMemo(() => canUseAudioWaveformWorker(), []);
	const vidConf = Internals.useUnsafeVideoConfig();
	if (vidConf === null) {
		throw new Error('Expected video config');
	}

	const waveformCanvas = useRef<HTMLCanvasElement>(null);
	const volumeCanvas = useRef<HTMLCanvasElement>(null);
	const waveformWorker = useRef<Worker | null>(null);
	const hasTransferredCanvas = useRef(false);
	const latestRequestId = useRef(0);
	const shouldRenderVolumeOverlay =
		doesVolumeChange && typeof volume === 'string';
	const parsedVolume = useMemo(() => parseVolume(volume), [volume]);

	useEffect(() => {
		if (canUseWorkerPath) {
			return;
		}

		const controller = new AbortController();

		setPeaks(null);
		setError(null);
		loadWaveformPeaks(src, controller.signal)
			.then((p) => {
				if (!controller.signal.aborted) {
					setPeaks(p);
				}
			})
			.catch((err) => {
				if (!controller.signal.aborted) {
					setError(err);
				}
			});

		return () => controller.abort();
	}, [canUseWorkerPath, src]);

	useEffect(() => {
		if (!canUseWorkerPath) {
			return;
		}

		const canvasElement = waveformCanvas.current;
		if (!canvasElement || hasTransferredCanvas.current) {
			return;
		}

		const worker = makeAudioWaveformWorker();
		let workerFailed = false;
		waveformWorker.current = worker;
		worker.addEventListener(
			'message',
			(event: MessageEvent<AudioWaveformWorkerOutgoingMessage>) => {
				if (event.data.type === 'error') {
					if (event.data.requestId !== latestRequestId.current) {
						return;
					}

					setError(new Error(event.data.message));
				}
			},
		);
		worker.addEventListener('error', (event) => {
			event.preventDefault();
			workerFailed = true;

			if (worker !== waveformWorker.current) {
				return;
			}

			worker.terminate();
			waveformWorker.current = null;
			hasTransferredCanvas.current = false;
			setError(getWaveformErrorMessage());
		});

		let offscreen: OffscreenCanvas;
		try {
			offscreen = canvasElement.transferControlToOffscreen();
		} catch (err) {
			worker.terminate();
			waveformWorker.current = null;
			if (canRetryCanvasTransfer(err)) {
				setWaveformCanvasKey((key) => key + 1);
				return;
			}

			throw err;
		}

		hasTransferredCanvas.current = true;
		worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);

		return () => {
			if (!workerFailed) {
				worker.postMessage({type: 'dispose'});
			}

			worker.terminate();
			waveformWorker.current = null;
			hasTransferredCanvas.current = false;
		};
	}, [canUseWorkerPath, waveformCanvasKey]);

	const portionPeaks = useMemo(() => {
		if (canUseWorkerPath || !peaks) {
			return null;
		}

		return sliceWaveformPeaks({
			durationInFrames: shouldTileLoopDisplay(loopDisplay)
				? loopDisplay.durationInFrames
				: durationInFrames,
			fps: vidConf.fps,
			peaks,
			playbackRate,
			startFrom,
		});
	}, [
		canUseWorkerPath,
		durationInFrames,
		loopDisplay,
		peaks,
		playbackRate,
		startFrom,
		vidConf.fps,
	]);

	useEffect(() => {
		const {current: canvasElement} = waveformCanvas;
		if (!canvasElement) {
			return;
		}

		const h = height;
		const w = Math.ceil(visualizationWidth);

		if (canUseWorkerPath) {
			const worker = waveformWorker.current;
			if (!worker || !hasTransferredCanvas.current) {
				return;
			}

			latestRequestId.current += 1;
			setError(null);
			const message: AudioWaveformWorkerRenderMessage = {
				type: 'render',
				requestId: latestRequestId.current,
				src,
				width: w,
				height: h,
				volume: parsedVolume,
				startFrom,
				durationInFrames,
				fps: vidConf.fps,
				playbackRate,
				loopDisplay,
			};
			worker.postMessage(message);
			return;
		}

		canvasElement.width = w;
		canvasElement.height = h;

		if (shouldTileLoopDisplay(loopDisplay)) {
			drawLoopedWaveform({
				canvas: canvasElement,
				peaks: portionPeaks ?? EMPTY_PEAKS,
				volume: parsedVolume,
				visualizationWidth,
				loopWidth: getLoopDisplayWidth({
					visualizationWidth,
					loopDisplay,
				}),
			});
		} else {
			drawBars({
				canvas: canvasElement,
				peaks: portionPeaks ?? EMPTY_PEAKS,
				color: WHITE_ALPHA_60,
				volume: parsedVolume,
				width: w,
			});
		}
	}, [
		canUseWorkerPath,
		durationInFrames,
		height,
		loopDisplay,
		playbackRate,
		parsedVolume,
		portionPeaks,
		src,
		startFrom,
		vidConf.fps,
		visualizationWidth,
		waveformCanvasKey,
	]);

	useEffect(() => {
		if (!shouldRenderVolumeOverlay) {
			return;
		}

		const {current: volumeCanvasElement} = volumeCanvas;
		if (!volumeCanvasElement) {
			return;
		}

		const h = height;
		const context = volumeCanvasElement.getContext('2d');
		if (!context) {
			return;
		}

		volumeCanvasElement.width = Math.ceil(visualizationWidth);
		volumeCanvasElement.height = h;

		context.clearRect(0, 0, visualizationWidth, h);
		if (!Array.isArray(parsedVolume)) {
			return;
		}

		context.beginPath();
		context.moveTo(0, h);
		parsedVolume.forEach((v, index) => {
			const x =
				parsedVolume.length <= 1
					? 0
					: (index / (parsedVolume.length - 1)) * visualizationWidth;
			const y = (1 - v) * (h - TIMELINE_BORDER * 2) + 1;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.strokeStyle = WHITE_ALPHA_70;
		context.stroke();
	}, [height, parsedVolume, shouldRenderVolumeOverlay, visualizationWidth]);

	if (error) {
		return (
			<div style={getContainerStyle(height)}>
				<div style={errorMessage}>
					No waveform available. The audio could not be decoded or may not
					support CORS.
				</div>
			</div>
		);
	}

	if (!canUseWorkerPath && !peaks) {
		return null;
	}

	return (
		<div style={getContainerStyle(height)}>
			<canvas
				key={waveformCanvasKey}
				ref={waveformCanvas}
				style={waveformCanvasStyle}
			/>
			{shouldRenderVolumeOverlay ? (
				<canvas ref={volumeCanvas} style={volumeCanvasStyle} />
			) : null}
		</div>
	);
};
