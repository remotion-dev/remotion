import {createIsoBaseMedia} from './create/iso-base-media/create-iso-base-media';
import {createMatroskaMedia} from './create/matroska/create-matroska-media';
import {createWav} from './create/wav/create-wav';
import type {ConvertMediaContainer} from './get-available-containers';

export const selectContainerCreator = (container: ConvertMediaContainer) => {
	if (container === 'mp4') {
		return createIsoBaseMedia;
	}

	if (container === 'wav') {
		return createWav;
	}

	if (container === 'webm') {
		return createMatroskaMedia;
	}

	throw new Error(`Unsupported container: ${container satisfies never}`);
};
