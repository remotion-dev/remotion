import type {ParseMediaOnWorker} from './options';

export type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';

/**
 * @deprecated Use Mediabunny instead: https://www.remotion.dev/docs/mediabunny
 */
export const parseMediaOnServerWorker: ParseMediaOnWorker = () => {
	throw new Error(
		'parseMediaOnServerWorker is not available in CJS mode. Load this function using ESM to use it.',
	);
};
