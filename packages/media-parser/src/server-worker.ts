import type {ParseMediaOnWorker} from './options';

export type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';

export const parseMediaOnServerWorker: ParseMediaOnWorker = () => {
	throw new Error(
		'parseMediaOnServerWorker is not available in CJS mode. Load this function using ESM to use it.',
	);
};
