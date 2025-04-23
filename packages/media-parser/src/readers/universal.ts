import {
	fetchClearPreloadCache,
	fetchCreateAdjacentFileSource,
	fetchPreload,
	fetchReadContent,
	fetchReadWholeAsText,
} from './from-fetch';
import {
	nodeCreateAdjacentFileSource,
	nodeReadContent,
	nodeReadWholeAsText,
} from './from-node';
import {
	webFileCreateAdjacentFileSource,
	webFileReadContent,
	webFileReadWholeAsText,
} from './from-web-file';
import type {ReaderInterface} from './reader';

export const universalReader: ReaderInterface = {
	read: (params) => {
		if (params.src instanceof Blob) {
			return webFileReadContent(params);
		}

		if (
			params.src.toString().startsWith('http') ||
			params.src.toString().startsWith('blob:')
		) {
			return fetchReadContent(params);
		}

		return nodeReadContent(params);
	},
	readWholeAsText: (src) => {
		if (src instanceof Blob) {
			return webFileReadWholeAsText(src);
		}

		if (
			src.toString().startsWith('http') ||
			src.toString().startsWith('blob:')
		) {
			return fetchReadWholeAsText(src);
		}

		return nodeReadWholeAsText(src);
	},
	createAdjacentFileSource: (relativePath, src) => {
		if (src instanceof Blob) {
			return webFileCreateAdjacentFileSource(relativePath, src);
		}

		if (
			src.toString().startsWith('http') ||
			src.toString().startsWith('blob:')
		) {
			return fetchCreateAdjacentFileSource(relativePath, src);
		}

		return nodeCreateAdjacentFileSource(relativePath, src);
	},
	preload: ({src, range, logLevel}) => {
		if (src instanceof Blob) {
			return;
		}

		if (
			src.toString().startsWith('http') ||
			src.toString().startsWith('blob:')
		) {
			return fetchPreload({range, src, logLevel});
		}
	},
	clearPreloadCache: ({src, range, logLevel}) => {
		if (src instanceof Blob) {
			return;
		}

		if (
			src.toString().startsWith('http') ||
			src.toString().startsWith('blob:')
		) {
			return fetchClearPreloadCache({src, range, logLevel});
		}
	},
};
