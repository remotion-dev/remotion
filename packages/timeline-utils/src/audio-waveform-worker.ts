/// <reference lib="webworker" />

import type {
	AudioWaveformWorkerIncomingMessage,
	AudioWaveformWorkerOutgoingMessage,
} from './audio-waveform/audio-waveform-worker-types';
import {loadWaveformPeaks} from './audio-waveform/load-waveform-peaks';

declare const self: DedicatedWorkerGlobalScope;

const postPeaks = (requestId: number, peaks: Float32Array, final: boolean) => {
	// Structured cloning copies the array, so the decoder can keep
	// mutating its buffer while the main thread reads the snapshot.
	const payload: AudioWaveformWorkerOutgoingMessage = {
		type: 'peaks',
		requestId,
		peaks,
		final,
	};
	self.postMessage(payload);
};

const postError = (requestId: number, error: unknown) => {
	const message =
		error instanceof Error ? error.message : 'Failed to load waveform';

	const payload: AudioWaveformWorkerOutgoingMessage = {
		type: 'error',
		requestId,
		message,
	};
	self.postMessage(payload);
};

self.addEventListener(
	'message',
	(event: MessageEvent<AudioWaveformWorkerIncomingMessage>) => {
		const message = event.data;
		const controller = new AbortController();

		loadWaveformPeaks(message.src, controller.signal, {
			onProgress: ({peaks, final}) => {
				if (!final) {
					postPeaks(message.requestId, peaks, false);
				}
			},
		})
			.then((peaks) => {
				postPeaks(message.requestId, peaks, true);
			})
			.catch((error) => {
				postError(message.requestId, error);
			});
	},
);
