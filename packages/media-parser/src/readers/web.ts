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
		if (params.src instanceof Blob) {
			return webFileReadContent(params);
		}

		return fetchReadContent(params);
	},
	createAdjacentFileSource: (relativePath, src) => {
		if (src instanceof Blob) {
			return webFileCreateAdjacentFileSource(relativePath, src);
		}

		return fetchCreateAdjacentFileSource(relativePath, src);
	},
	readWholeAsText: (src) => {
		if (src instanceof Blob) {
			return webFileReadWholeAsText(src);
		}

		return fetchReadWholeAsText(src);
	},
};
