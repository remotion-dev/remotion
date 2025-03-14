import type {
	Options,
	ParseMediaFields,
	ParseMediaOnWorker,
	ParseMediaOnWorkerOptions,
} from './options';
import {parseMediaOnWorkerImplementation} from './parse-media-on-worker-entry';

export const parseMediaOnWebWorker: ParseMediaOnWorker = <
	F extends Options<ParseMediaFields>,
>(
	params: ParseMediaOnWorkerOptions<F>,
) => {
	return parseMediaOnWorkerImplementation(
		params,
		new URL('./worker-web-entry'),
		'parseMediaOnWebWorker',
	);
};
