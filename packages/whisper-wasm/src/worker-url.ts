export const makeWorkerUrl = () =>
	// @ts-expect-error
	new Worker(new URL('./worker.mjs', import.meta.url), {
		type: 'module',
	});
