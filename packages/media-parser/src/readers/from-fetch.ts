/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */
import type {MediaParserController} from '../controller/media-parser-controller';
import {MediaParserAbortError} from '../errors';
import type {MediaParserLogLevel} from '../log';
import {Log} from '../log';
import type {ParseMediaRange} from '../options';
import {getLengthAndReader} from './fetch/get-body-and-reader';
import {resolveUrl} from './fetch/resolve-url';
import type {
	CreateAdjacentFileSource,
	MediaParserReaderInterface,
	PreloadContent,
	ReadContent,
	ReadWholeAsText,
} from './reader';

interface ParsedContentRange {
	unit: string;
	start?: number | null;
	end?: number | null;
	size?: number | null;
}

/**
 * Parse Content-Range header.
 * From: https://github.com/gregberge/content-range/blob/main/src/index.ts
 */
export function parseContentRange(input: string): ParsedContentRange | null {
	const matches = input.match(/^(\w+) ((\d+)-(\d+)|\*)\/(\d+|\*)$/);
	if (!matches) return null;
	const [, unit, , start, end, size] = matches;
	const range = {
		unit,
		start: start != null ? Number(start) : null,
		end: end != null ? Number(end) : null,
		size: size === '*' ? null : Number(size),
	};
	if (range.start === null && range.end === null && range.size === null) {
		return null;
	}

	return range;
}

const validateContentRangeAndDetectIfSupported = ({
	requestedRange,
	parsedContentRange,
	statusCode,
}: {
	requestedRange: number | [number, number];
	parsedContentRange: ParsedContentRange | null;
	statusCode: number;
}): {supportsContentRange: boolean} => {
	if (statusCode === 206) {
		return {supportsContentRange: true};
	}

	if (
		typeof requestedRange === 'number' &&
		parsedContentRange?.start !== requestedRange
	) {
		if (requestedRange === 0) {
			return {supportsContentRange: false};
		}

		throw new Error(
			`Range header (${requestedRange}) does not match content-range header (${parsedContentRange?.start})`,
		);
	}

	if (
		requestedRange !== null &&
		typeof requestedRange !== 'number' &&
		(parsedContentRange?.start !== requestedRange[0] ||
			parsedContentRange?.end !== requestedRange[1])
	) {
		throw new Error(
			`Range header (${requestedRange}) does not match content-range header (${parsedContentRange?.start})`,
		);
	}

	return {supportsContentRange: true};
};

export const makeFetchRequest = async ({
	range,
	src,
	controller,
}: {
	range: ParseMediaRange;
	src: string | URL;
	controller: MediaParserController | null;
}) => {
	const resolvedUrl = resolveUrl(src);

	const resolvedUrlString = resolvedUrl.toString();

	if (
		!resolvedUrlString.startsWith('https://') &&
		!resolvedUrlString.startsWith('blob:') &&
		!resolvedUrlString.startsWith('data:') &&
		!resolvedUrlString.startsWith('http://')
	) {
		return Promise.reject(
			new Error(
				`${resolvedUrlString} is not a URL - needs to start with http:// or https:// or blob:. If you want to read a local file, pass \`reader: nodeReader\` to parseMedia().`,
			),
		);
	}

	const ownController = new AbortController();

	const cache =
		typeof navigator !== 'undefined' &&
		navigator.userAgent.includes('Cloudflare-Workers')
			? undefined
			: // Disable Next.js caching
				'no-store';

	const requestedRange = range === null ? 0 : range;

	const asString =
		typeof resolvedUrl === 'string' ? resolvedUrl : resolvedUrl.pathname;

	const requestWithoutRange = asString.endsWith('.m3u8');

	const canLiveWithoutContentLength =
		asString.endsWith('.m3u8') || asString.endsWith('.ts');

	const headers: {
		Range?: string;
	} =
		requestedRange === 0 && requestWithoutRange
			? {}
			: typeof requestedRange === 'number'
				? {
						Range: `bytes=${requestedRange}-`,
					}
				: {
						Range: `bytes=${`${requestedRange[0]}-${requestedRange[1]}`}`,
					};

	const res = await fetch(resolvedUrl, {
		headers,
		signal: ownController.signal,
		cache,
	});

	const contentRange = res.headers.get('content-range');
	const parsedContentRange = contentRange
		? parseContentRange(contentRange)
		: null;

	if (!res.ok) {
		throw new Error(
			`Server returned status code ${res.status} for ${resolvedUrl} and range ${requestedRange}`,
		);
	}

	const {supportsContentRange} = validateContentRangeAndDetectIfSupported({
		requestedRange,
		parsedContentRange,
		statusCode: res.status,
	});

	if (controller) {
		controller._internals.signal.addEventListener(
			'abort',
			() => {
				ownController.abort(new MediaParserAbortError('Aborted by user'));
			},
			{once: true},
		);
	}

	const contentDisposition = res.headers.get('content-disposition');
	const name = contentDisposition?.match(/filename="([^"]+)"/)?.[1];

	const {contentLength, needsContentRange, reader} = await getLengthAndReader({
		canLiveWithoutContentLength,
		res,
		ownController,
		requestedWithoutRange: requestWithoutRange,
	});
	const contentType = res.headers.get('content-type');

	return {
		contentLength,
		needsContentRange,
		reader,
		name,
		contentType,
		supportsContentRange,
	};
};

const cacheKey = ({
	src,
	range,
}: {
	src: string | URL;
	range: ParseMediaRange;
}) => {
	return `${src}-${JSON.stringify(range)}`;
};

export type PrefetchCache = Map<string, ReturnType<typeof makeFetchRequest>>;

const makeFetchRequestOrGetCached = ({
	range,
	src,
	controller,
	logLevel,
	prefetchCache,
}: {
	range: ParseMediaRange;
	src: string | URL;
	controller: MediaParserController | null;
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
}) => {
	const key = cacheKey({src, range});
	const cached = prefetchCache.get(key);
	if (cached) {
		Log.verbose(logLevel, `Reading from preload cache for ${key}`);
		return cached;
	}

	Log.verbose(logLevel, `Fetching ${key}`);
	const result = makeFetchRequest({range, src, controller});
	prefetchCache.set(key, result);
	return result;
};

export const fetchReadContent: ReadContent = async ({
	src,
	range,
	controller,
	logLevel,
	prefetchCache,
}) => {
	if (typeof src !== 'string' && src instanceof URL === false) {
		throw new Error('src must be a string when using `fetchReader`');
	}

	const fallbackName = src.toString().split('/').pop() as string;

	const res = makeFetchRequestOrGetCached({
		range,
		src,
		controller,
		logLevel,
		prefetchCache,
	});

	const key = cacheKey({src, range});
	prefetchCache.delete(key);

	const {
		reader,
		contentLength,
		needsContentRange,
		name,
		supportsContentRange,
		contentType,
	} = await res;

	if (controller) {
		controller._internals.signal.addEventListener(
			'abort',
			() => {
				reader.reader.cancel().catch(() => {
					// Prevent unhandled rejection in Firefox
				});
			},
			{once: true},
		);
	}

	return {
		reader,
		contentLength,
		contentType,
		name: name ?? fallbackName,
		supportsContentRange,
		needsContentRange,
	};
};

export const fetchPreload: PreloadContent = ({
	src,
	range,
	logLevel,
	prefetchCache,
}) => {
	if (typeof src !== 'string' && src instanceof URL === false) {
		throw new Error('src must be a string when using `fetchReader`');
	}

	const key = cacheKey({src, range});

	if (prefetchCache.has(key)) {
		return prefetchCache.get(key);
	}

	makeFetchRequestOrGetCached({
		range,
		src,
		controller: null,
		logLevel,
		prefetchCache,
	});
};

export const fetchReadWholeAsText: ReadWholeAsText = async (src) => {
	if (typeof src !== 'string' && src instanceof URL === false) {
		throw new Error('src must be a string when using `fetchReader`');
	}

	const res = await fetch(src);
	if (!res.ok) {
		throw new Error(`Failed to fetch ${src} (HTTP code: ${res.status})`);
	}

	return res.text();
};

export const fetchCreateAdjacentFileSource: CreateAdjacentFileSource = (
	relativePath,
	src,
) => {
	if (typeof src !== 'string' && src instanceof URL === false) {
		throw new Error('src must be a string or URL when using `fetchReader`');
	}

	return new URL(relativePath, src).toString();
};

export const fetchReader: MediaParserReaderInterface = {
	read: fetchReadContent,
	readWholeAsText: fetchReadWholeAsText,
	createAdjacentFileSource: fetchCreateAdjacentFileSource,
	preload: fetchPreload,
};
