import {MediaParserInternals} from '@remotion/media-parser';
import type {ConvertMediaContainer} from './get-available-containers';

export const selectContainerCreator = (container: ConvertMediaContainer) => {
	if (container === 'mp4') {
		return MediaParserInternals.createIsoBaseMedia;
	}

	if (container === 'wav') {
		return MediaParserInternals.createWav;
	}

	if (container === 'webm') {
		return MediaParserInternals.createMatroskaMedia;
	}

	throw new Error(`Unsupported container: ${container satisfies never}`);
};
