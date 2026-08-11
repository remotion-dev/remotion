import {createIsoBaseMedia} from './create/iso-base-media/create-iso-base-media';
import {createMatroskaMedia} from './create/matroska/create-matroska-media';
import type {MediaFnGeneratorInput} from './create/media-fn';
import {createWav} from './create/wav/create-wav';

export const createMedia = (params: MediaFnGeneratorInput) => {
	if (params.container === 'mp4') {
		return createIsoBaseMedia(params);
	}

	if (params.container === 'wav') {
		return createWav(params);
	}

	if (params.container === 'webm') {
		return createMatroskaMedia(params);
	}

	throw new Error(`Unsupported container: ${params.container satisfies never}`);
};
