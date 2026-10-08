export {
	hasBeenAborted,
	ImageType,
	IsAnImageError,
	IsAnUnsupportedFileTypeError,
	IsAPdfError,
	MediaParserAbortError,
} from './errors';
import type {ParseMediaOnWorker} from './options';

export type {ParseMediaOnWorker, ParseMediaOnWorkerOptions} from './options';

/**
 * @deprecated Use Mediabunny instead: https://www.remotion.dev/docs/mediabunny
 */
export const parseMediaOnWebWorker: ParseMediaOnWorker = () => {
	throw new Error(
		'parseMediaOnWebWorker is not available in CJS mode. Load this function using ESM to use it.',
	);
};
