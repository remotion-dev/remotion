/// <reference lib="webworker" />

import type {
	AudioWaveformWorkerIncomingMessage,
	AudioWaveformWorkerOutgoingMessage,
	AudioWaveformWorkerRenderMessage,
} from './audio-waveform/audio-waveform-worker-types';
import {drawBars} from './audio-waveform/draw-peaks';
import {loadWaveformPeaks} from './audio-waveform/load-waveform-peaks';
import {sliceWaveformPeaks} from './audio-waveform/slice-waveform-peaks';
import {getLoopDisplayWidth, shouldTileLoopDisplay} from './loop-display';

declare const self: DedicatedWorkerGlobalScope;

let canvas: OffscreenCanvas | null = null;
let currentController: AbortController | null = null;
let latestRequestId = 0;

const postError = (requestId: number, error: unknown) => {
	const message =
		error instanceof Error ? error.message : 'Failed to render waveform';

	const payload: AudioWaveformWorkerOutgoingMessage = {
		type: 'error',
		requestId,
		message,
	};
	self.postMessage(payload);
};

const drawPartialWaveform = (
	message: AudioWaveformWorkerRenderMessage,
	peaks: Float32Array,
) => {
	if (!canvas) {
		return;
	}

	const portionPeaks = sliceWaveformPeaks({
		durationInFrames: shouldTileLoopDisplay(message.loopDisplay)
			? message.loopDisplay.durationInFrames
			: message.durationInFrames,
		fps: message.fps,
		peaks,
		playbackRate: message.playbackRate,
		startFrom: message.startFrom,
	});

	if (!shouldTileLoopDisplay(message.loopDisplay)) {
		drawBars({
			canvas,
			peaks: portionPeaks,
			color: 'rgba(255, 255, 255, 0.6)',
			volume: message.volume,
			width: message.width,
		});
		return;
	}

	const loopWidth = getLoopDisplayWidth({
		visualizationWidth: message.width,
		loopDisplay: message.loopDisplay,
	});
	const targetCanvas = new OffscreenCanvas(
		Math.max(1, Math.ceil(loopWidth)),
		Math.max(1, Math.ceil(message.height)),
	);
	drawBars({
		canvas: targetCanvas,
		peaks: portionPeaks,
		color: 'rgba(255, 255, 255, 0.6)',
		volume: message.volume,
		width: targetCanvas.width,
	});

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
	ctx.clearRect(0, 0, message.width, message.height);
	ctx.fillStyle = pattern;
	ctx.fillRect(0, 0, message.width, message.height);
};

const renderWaveform = async (message: AudioWaveformWorkerRenderMessage) => {
	if (!canvas) {
		postError(message.requestId, new Error('Waveform canvas not initialized'));
		return;
	}

	const controller = new AbortController();
	currentController?.abort();
	currentController = controller;
	latestRequestId = message.requestId;

	try {
		// The timeline layout can hand us a zero or slightly negative width for
		// very short sequences (track width minus the border). Setting a negative
		// value on OffscreenCanvas throws a DOMException, so clamp before assigning.
		canvas.width = Math.max(0, Math.ceil(message.width));
		canvas.height = Math.max(0, Math.ceil(message.height));

		const peaks = await loadWaveformPeaks(message.src, controller.signal, {
			onProgress: ({peaks: nextPeaks}) => {
				if (
					controller.signal.aborted ||
					latestRequestId !== message.requestId
				) {
					return;
				}

				drawPartialWaveform(message, nextPeaks);
			},
		});
		if (controller.signal.aborted || latestRequestId !== message.requestId) {
			return;
		}

		drawPartialWaveform(message, peaks);
	} catch (error) {
		if (controller.signal.aborted || latestRequestId !== message.requestId) {
			return;
		}

		postError(message.requestId, error);
	}
};

self.addEventListener(
	'message',
	(event: MessageEvent<AudioWaveformWorkerIncomingMessage>) => {
		const message = event.data;
		if (message.type === 'init') {
			canvas = message.canvas;
			return;
		}

		if (message.type === 'dispose') {
			currentController?.abort();
			currentController = null;
			canvas = null;
			return;
		}

		renderWaveform(message).catch((error) => {
			postError(message.requestId, error);
		});
	},
);
