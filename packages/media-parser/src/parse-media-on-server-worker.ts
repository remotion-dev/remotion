import type {
	Options,
	ParseMedia,
	ParseMediaFields,
	ParseMediaOptions,
} from './options';
import {parseMediaOnWorkerImplementation} from './parse-media-on-worker-entry';

export const parseMediaOnServerWorker: ParseMedia = <
	F extends Options<ParseMediaFields>,
>(
	params: ParseMediaOptions<F>,
) => {
	return parseMediaOnWorkerImplementation(
		params,
		new URL('./worker-server-entry'),
		'parseMediaOnServerWorker',
	);
};
