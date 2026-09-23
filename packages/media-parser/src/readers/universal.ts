import {
	fetchCreateAdjacentFileSource,
	fetchPreload,
	fetchReadContent,
	fetchReadWholeAsText,
} from './from-fetch';
import {
	isNodeFsAvailable,
	nodeCreateAdjacentFileSource,
	nodeReadContent,
	nodeReadWholeAsText,
} from './from-node';
import {
	webFileCreateAdjacentFileSource,
	webFileReadContent,
	webFileReadWholeAsText,
} from './from-web-file';
import type {MediaParserReaderInterface} from './reader';

// Returns the URL to fetch, or null if `src` should be read from the file system.
// In the browser there is no file system, so a relative or root-relative `src`
// (e.g. from `staticFile()`) is a URL relative to the page.
const getFetchUrl = (src: string | URL): string | URL | null => {
	if (src.toString().startsWith('http') || src.toString().startsWith('blob:')) {
		return src;
	}

	if (
		typeof window !== 'undefined' &&
		typeof window.location !== 'undefined' &&
		!isNodeFsAvailable()
	) {
		return new URL(src, window.location.href).toString();
	}

	return null;
};

export const universalReader: MediaParserReaderInterface = {
	read: (params) => {
		if (params.src instanceof Blob) {
			return webFileReadContent(params);
		}

		const fetchUrl = getFetchUrl(params.src);
		if (fetchUrl !== null) {
			return fetchReadContent({...params, src: fetchUrl});
		}

		return nodeReadContent(params);
	},
	readWholeAsText: (src) => {
		if (src instanceof Blob) {
			return webFileReadWholeAsText(src);
		}

		const fetchUrl = getFetchUrl(src);
		if (fetchUrl !== null) {
			return fetchReadWholeAsText(fetchUrl);
		}

		return nodeReadWholeAsText(src);
	},
	createAdjacentFileSource: (relativePath, src) => {
		if (src instanceof Blob) {
			return webFileCreateAdjacentFileSource(relativePath, src);
		}

		const fetchUrl = getFetchUrl(src);
		if (fetchUrl !== null) {
			return fetchCreateAdjacentFileSource(relativePath, fetchUrl);
		}

		return nodeCreateAdjacentFileSource(relativePath, src);
	},
	preload: ({src, range, logLevel, prefetchCache}) => {
		if (src instanceof Blob) {
			return;
		}

		const fetchUrl = getFetchUrl(src);
		if (fetchUrl !== null) {
			return fetchPreload({range, src: fetchUrl, logLevel, prefetchCache});
		}
	},
};
