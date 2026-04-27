import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {LoopDisplay} from 'remotion';
import {Internals} from 'remotion';
import {LIGHT_TRANSPARENT} from '../helpers/colors';
import {TIMELINE_BORDER} from '../helpers/timeline-layout';
import {makeAudioWaveformWorker} from '../make-audio-waveform-worker';
import type {
	AudioWaveformWorkerOutgoingMessage,
	AudioWaveformWorkerRenderMessage,
} from './audio-waveform-worker-types';
import {drawBars} from './draw-peaks';
import {loadWaveformPeaks} from './load-waveform-peaks';
import {
	getLoopDisplayWidth,
	shouldTileLoopDisplay,
} from './looped-media-timeline';
import {sliceWaveformPeaks} from './slice-waveform-peaks';

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

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	position: 'absolute',
	inset: 0,
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

const waveformCanvasStyle: React.CSSProperties = {
	pointerEvents: 'none',
	width: '100%',
	height: '100%',
};

const volumeCanvasStyle: React.CSSProperties = {
	position: 'absolute',
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
	volume: number;
	visualizationWidth: number;
	loopWidth: number;
}) => {
	const h = canvas.height;
	const w = Math.ceil(visualizationWidth);
	const targetCanvas = document.createElement('canvas');
	targetCanvas.width = Math.max(1, Math.ceil(loopWidth));
	targetCanvas.height = h;

	drawBars(
		targetCanvas,
		peaks,
		'rgba(255, 255, 255, 0.6)',
		volume,
		targetCanvas.width,
	);

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
	readonly visualizationWidth: number;
	readonly startFrom: number;
	readonly durationInFrames: number;
	readonly volume: string | number;
	readonly doesVolumeChange: boolean;
	readonly playbackRate: number;
	readonly loopDisplay: LoopDisplay | undefined;
}> = ({
	src,
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

	const containerRef = useRef<HTMLDivElement>(null);
	const waveformCanvas = useRef<HTMLCanvasElement>(null);
	const volumeCanvas = useRef<HTMLCanvasElement>(null);
	const waveformWorker = useRef<Worker | null>(null);
	const hasTransferredCanvas = useRef(false);
	const latestRequestId = useRef(0);

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
			worker.postMessage({type: 'dispose'});
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
		const {current: containerElement} = containerRef;
		if (!canvasElement || !containerElement) {
			return;
		}

		const h = containerElement.clientHeight;
		const w = Math.ceil(visualizationWidth);

		const vol = typeof volume === 'number' ? volume : 1;
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
				volume: vol,
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
				volume: vol,
				visualizationWidth,
				loopWidth: getLoopDisplayWidth({
					visualizationWidth,
					loopDisplay,
				}),
			});
		} else {
			drawBars(
				canvasElement,
				portionPeaks ?? EMPTY_PEAKS,
				'rgba(255, 255, 255, 0.6)',
				vol,
				w,
			);
		}
	}, [
		canUseWorkerPath,
		durationInFrames,
		loopDisplay,
		playbackRate,
		portionPeaks,
		src,
		startFrom,
		vidConf.fps,
		visualizationWidth,
		volume,
		waveformCanvasKey,
	]);

	useEffect(() => {
		const {current: volumeCanvasElement} = volumeCanvas;
		const {current: containerElement} = containerRef;
		if (!volumeCanvasElement || !containerElement) {
			return;
		}

		const h = containerElement.clientHeight;
		const context = volumeCanvasElement.getContext('2d');
		if (!context) {
			return;
		}

		volumeCanvasElement.width = Math.ceil(visualizationWidth);
		volumeCanvasElement.height = h;

		context.clearRect(0, 0, visualizationWidth, h);
		if (!doesVolumeChange || typeof volume === 'number') {
			return;
		}

		const volumes = volume.split(',').map((v) => Number(v));
		context.beginPath();
		context.moveTo(0, h);
		volumes.forEach((v, index) => {
			const x = (index / (volumes.length - 1)) * visualizationWidth;
			const y = (1 - v) * (h - TIMELINE_BORDER * 2) + 1;
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.strokeStyle = LIGHT_TRANSPARENT;
		context.stroke();
	}, [visualizationWidth, volume, doesVolumeChange]);

	if (error) {
		return (
			<div style={container}>
				<div style={errorMessage}>
					No waveform available. Audio might not support CORS.
				</div>
			</div>
		);
	}

	if (!canUseWorkerPath && !peaks) {
		return null;
	}

	return (
		<div ref={containerRef} style={container}>
			<canvas
				key={waveformCanvasKey}
				ref={waveformCanvas}
				style={waveformCanvasStyle}
			/>
			<canvas ref={volumeCanvas} style={volumeCanvasStyle} />
		</div>
	);
};
