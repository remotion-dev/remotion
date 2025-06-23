import type {Options, ParseMediaFields} from './fields';
import type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';
import {parseMediaOnWorkerImplementation} from './parse-media-on-worker-entry';

export const parseMediaOnServerWorker: ParseMediaOnWorker = <
	F extends Options<ParseMediaFields>,
>(
	params: ParseMediaOnWorkerOptions<F>,
) => {
	if (typeof Worker === 'undefined') {
		throw new Error(
			'"Worker" is not available. Cannot call parseMediaOnServerWorker()',
		);
	}

	const worker = new Worker(new URL('./worker-server-entry', import.meta.url));

	return parseMediaOnWorkerImplementation(
		params,
		worker,
		'parseMediaOnServerWorker',
	);
};
