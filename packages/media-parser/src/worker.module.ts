import type {Options, ParseMediaFields} from './fields';
import type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';
import {parseMediaOnWorkerImplementation} from './parse-media-on-worker-entry';

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

	const worker = new Worker(new URL('./worker-web-entry.mjs', import.meta.url));

	return parseMediaOnWorkerImplementation(
		params,
		worker,
		'parseMediaOnWebWorker',
	);
};
