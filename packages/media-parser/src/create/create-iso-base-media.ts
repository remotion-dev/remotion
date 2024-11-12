import type {MediaFnGeneratorInput} from './media-fn';

export const createIsoBaseMedia = (
	options: MediaFnGeneratorInput,
): Promise<void> => {
	console.log(options);
	return Promise.resolve(undefined);
};
