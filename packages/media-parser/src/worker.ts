import type {ParseMediaOnWorker} from './options';

export type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';

export const parseMediaOnWebWorker: ParseMediaOnWorker = () => {
	throw new Error(
		'parseMediaOnWebWorker is not available in CJS mode. Load this function using ESM to use it.',
	);
};

export const parseMediaOnServerWorker: ParseMediaOnWorker = () => {
	throw new Error(
		'parseMediaOnServerWorker is not available in CJS mode. Load this function using ESM to use it.',
	);
};
