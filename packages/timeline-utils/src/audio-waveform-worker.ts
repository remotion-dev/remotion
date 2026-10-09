/// <reference lib="webworker" />

import type {
	AudioWaveformWorkerIncomingMessage,
	AudioWaveformWorkerOutgoingMessage,
	AudioWaveformWorkerPeaksMessage,
} from './audio-waveform/audio-waveform-worker-types';
import {loadWaveformPeaks} from './audio-waveform/load-waveform-peaks';

declare const self: DedicatedWorkerGlobalScope;

const postPeaks = (data: Omit<AudioWaveformWorkerPeaksMessage, 'type'>) => {
	// Structured cloning copies the array, so the decoder can keep
	// mutating its buffer while the main thread reads the snapshot.
	const payload: AudioWaveformWorkerOutgoingMessage = {
		type: 'peaks',
		...data,
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
			waveformSampleRate: message.waveformSampleRate,
			onProgress: ({peaks, maxima, final}) => {
				if (!final) {
					postPeaks({
						requestId: message.requestId,
						peaks,
						maxima,
						final: false,
						averageVolume: null,
					});
				}
			},
		})
			.then((result) => {
				postPeaks({requestId: message.requestId, ...result, final: true});
			})
			.catch((error) => {
				postError(message.requestId, error);
			});
	},
);
