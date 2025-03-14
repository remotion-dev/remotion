import type {
	Options,
	ParseMediaFields,
	ParseMediaOnWorker,
	ParseMediaOnWorkerOptions,
} from './options';
import {parseMediaOnWorkerImplementation} from './parse-media-on-worker-entry';

export type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';

export const parseMediaOnWebWorker: ParseMediaOnWorker = <
	F extends Options<ParseMediaFields>,
>(
	params: ParseMediaOnWorkerOptions<F>,
) => {
	return parseMediaOnWorkerImplementation(
		params,
		new URL('./worker-web-entry', import.meta.url),
		'parseMediaOnWebWorker',
	);
};

export const parseMediaOnServerWorker: ParseMediaOnWorker = <
	F extends Options<ParseMediaFields>,
>(
	params: ParseMediaOnWorkerOptions<F>,
) => {
	return parseMediaOnWorkerImplementation(
		params,
		new URL('./worker-server-entry', import.meta.url),
		'parseMediaOnServerWorker',
	);
};
