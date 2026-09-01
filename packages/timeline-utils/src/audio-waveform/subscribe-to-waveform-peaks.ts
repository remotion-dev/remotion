import type {
	AudioWaveformWorkerLoadMessage,
	AudioWaveformWorkerOutgoingMessage,
} from './audio-waveform-worker-types';
import {TARGET_SAMPLE_RATE} from './constants';
import {loadWaveformPeaks} from './load-waveform-peaks';
import {makeAudioWaveformWorker} from './make-audio-waveform-worker';

type WaveformPeaksListener = {
	readonly onPeaks: (peaks: Float32Array, final: boolean) => void;
	readonly onError: (error: Error) => void;
};

type InFlightLoad = {
	readonly src: string;
	readonly cacheKey: string;
	readonly waveformSampleRate: number;
	readonly listeners: Set<WaveformPeaksListener>;
	latestPeaks: Float32Array | null;
	requestId: number | null;
};

// All AudioWaveform instances share one decode worker and one peaks cache,
// so remounts (timeline virtualization, zoom window cropping) and multiple
// clips with the same src never re-fetch or re-decode the audio.
const peaksCache = new Map<string, Float32Array>();
const inFlightByCacheKey = new Map<string, InFlightLoad>();
const inFlightByRequestId = new Map<number, InFlightLoad>();

let worker: Worker | null = null;
let workerFailed = false;
let nextRequestId = 0;

const emitPeaks = (load: InFlightLoad, peaks: Float32Array, final: boolean) => {
	if (final) {
		peaksCache.set(load.cacheKey, peaks);
		load.latestPeaks = null;
		inFlightByCacheKey.delete(load.cacheKey);
		if (load.requestId !== null) {
			inFlightByRequestId.delete(load.requestId);
		}
	} else {
		load.latestPeaks = peaks;
	}

	for (const listener of load.listeners) {
		listener.onPeaks(peaks, final);
	}
};

const emitError = (load: InFlightLoad, error: Error) => {
	inFlightByCacheKey.delete(load.cacheKey);
	if (load.requestId !== null) {
		inFlightByRequestId.delete(load.requestId);
	}

	for (const listener of load.listeners) {
		listener.onError(error);
	}
};

const startMainThreadLoad = (load: InFlightLoad) => {
	load.requestId = null;

	// Never aborted: even if all subscribers unsubscribe, finishing the
	// decode fills the cache for the next mount.
	const controller = new AbortController();

	loadWaveformPeaks(load.src, controller.signal, {
		waveformSampleRate: load.waveformSampleRate,
		onProgress: ({peaks, final}) => {
			if (final) {
				return;
			}

			// The processor mutates the same array in place; snapshot it so
			// React state updates see a new reference.
			emitPeaks(load, peaks.slice(), false);
		},
	})
		.then((peaks) => {
			emitPeaks(load, peaks, true);
		})
		.catch((error) => {
			emitError(
				load,
				error instanceof Error
					? error
					: new Error('Failed to load waveform peaks'),
			);
		});
};

const handleWorkerFailure = () => {
	workerFailed = true;
	worker?.terminate();
	worker = null;

	const pending = [...inFlightByRequestId.values()];
	inFlightByRequestId.clear();
	for (const load of pending) {
		startMainThreadLoad(load);
	}
};

const getOrCreateWorker = (): Worker | null => {
	if (workerFailed || typeof Worker === 'undefined') {
		return null;
	}

	if (worker) {
		return worker;
	}

	try {
		worker = makeAudioWaveformWorker();
	} catch {
		workerFailed = true;
		return null;
	}

	worker.addEventListener(
		'message',
		(event: MessageEvent<AudioWaveformWorkerOutgoingMessage>) => {
			const message = event.data;
			const load = inFlightByRequestId.get(message.requestId);
			if (!load) {
				return;
			}

			if (message.type === 'error') {
				emitError(load, new Error(message.message));
				return;
			}

			emitPeaks(load, message.peaks, message.final);
		},
	);
	worker.addEventListener('error', (event) => {
		event.preventDefault();
		handleWorkerFailure();
	});

	return worker;
};

export const subscribeToWaveformPeaks = ({
	src,
	waveformSampleRate = TARGET_SAMPLE_RATE,
	onPeaks,
	onError,
}: {
	readonly src: string;
	readonly waveformSampleRate?: number;
	readonly onPeaks: (peaks: Float32Array, final: boolean) => void;
	readonly onError: (error: Error) => void;
}): (() => void) => {
	const cacheKey = `${waveformSampleRate}:${src}`;
	const cached = peaksCache.get(cacheKey);
	if (cached) {
		onPeaks(cached, true);
		return () => undefined;
	}

	const listener: WaveformPeaksListener = {onPeaks, onError};

	const existing = inFlightByCacheKey.get(cacheKey);
	if (existing) {
		existing.listeners.add(listener);
		if (existing.latestPeaks) {
			onPeaks(existing.latestPeaks, false);
		}

		return () => {
			existing.listeners.delete(listener);
		};
	}

	const load: InFlightLoad = {
		src,
		cacheKey,
		waveformSampleRate,
		listeners: new Set([listener]),
		latestPeaks: null,
		requestId: null,
	};
	inFlightByCacheKey.set(cacheKey, load);

	const workerInstance = getOrCreateWorker();
	if (workerInstance) {
		const requestId = nextRequestId++;
		load.requestId = requestId;
		inFlightByRequestId.set(requestId, load);
		const message: AudioWaveformWorkerLoadMessage = {
			type: 'load',
			requestId,
			src,
			waveformSampleRate,
		};
		workerInstance.postMessage(message);
	} else {
		startMainThreadLoad(load);
	}

	return () => {
		load.listeners.delete(listener);
	};
};
