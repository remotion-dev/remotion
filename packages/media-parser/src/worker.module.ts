import type {Options, ParseMediaFields} from './fields';
import type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';
import {parseMediaOnWorkerImplementation} from './parse-media-on-worker-entry';

export {
	hasBeenAborted,
	ImageType,
	IsAnImageError,
	IsAnUnsupportedFileTypeError,
	IsAPdfError,
	MediaParserAbortError,
} from './errors';
export type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';

export const parseMediaOnWebWorker: ParseMediaOnWorker = <
	F extends Options<ParseMediaFields>,
>(
	params: ParseMediaOnWorkerOptions<F>,
) => {
	if (typeof Worker === 'undefined') {
		throw new Error(
			'"Worker" is not available. Cannot call parseMediaOnWebWorker()',
		);
	}

	if (import.meta.url.includes('.vite/deps')) {
		const err = [
			'Detected Vite pre-bundling, which will break the worker.',
			'Please add the following to your vite.config.js:',
			'  optimizeDeps: {',
			'    exclude: ["@remotion/media-parser/worker"]',
			'  }',
		].join('\n');
		throw new Error(err);
	}

	const worker = new Worker(new URL('./worker-web-entry.mjs', import.meta.url));

	// The worker has no page URL to resolve a relative `src`
	// (e.g. from `staticFile()`) against, so resolve it here.
	const src =
		typeof params.src === 'string' &&
		!/^[a-z][a-z\d+.-]*:/i.test(params.src) &&
		typeof window !== 'undefined' &&
		typeof window.location !== 'undefined'
			? new URL(params.src, window.location.href).toString()
			: params.src;

	return parseMediaOnWorkerImplementation(
		{...params, src},
		worker,
		'parseMediaOnWebWorker',
	);
};
