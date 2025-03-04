import {
	fetchCreateAdjacentFileSource,
	fetchReadContent,
	fetchReadWholeAsText,
} from './from-fetch';
import {
	webFileCreateAdjacentFileSource,
	webFileReadContent,
	webFileReadWholeAsText,
} from './from-web-file';
import type {ReaderInterface} from './reader';

export const webReader: ReaderInterface = {
	read: (params) => {
		if (params.src instanceof File) {
			return webFileReadContent(params);
		}

		return fetchReadContent(params);
	},
	createAdjacentFileSource: (relativePath, src) => {
		if (src instanceof File) {
			return webFileCreateAdjacentFileSource(relativePath, src);
		}

		return fetchCreateAdjacentFileSource(relativePath, src);
	},
	readWholeAsText: (src) => {
		if (src instanceof File) {
			return webFileReadWholeAsText(src);
		}

		return fetchReadWholeAsText(src);
	},
};
