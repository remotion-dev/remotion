export const makeAudioWaveformWorker = () => {
	// @ts-expect-error `import.meta.url` is required for bundling the worker entry.
	return new Worker(new URL('./audio-waveform-worker.mjs', import.meta.url), {
		type: 'module',
	});
};
