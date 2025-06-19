import {createIsoBaseMedia} from './create/iso-base-media/create-iso-base-media';
import {createMatroskaMedia} from './create/matroska/create-matroska-media';
import type {MediaFnGeneratorInput} from './create/media-fn';
import {createMp3} from './create/mp3/create-mp3';
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

	if (params.container === 'mp3') {
		return createMp3(params);
	}

	throw new Error(`Unsupported container: ${params.container satisfies never}`);
};
