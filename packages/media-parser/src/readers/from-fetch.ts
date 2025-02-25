/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */
import {MediaParserAbortError} from '../errors';
import {getLengthAndReader} from './fetch/get-body-and-reader';
import {resolveUrl} from './fetch/resolve-url';
import type {ReaderInterface} from './reader';

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
	actualRange,
	parsedContentRange,
	statusCode,
}: {
	actualRange: number | [number, number];
	parsedContentRange: ParsedContentRange | null;
	statusCode: number;
}): {supportsContentRange: boolean} => {
	if (statusCode === 206) {
		return {supportsContentRange: true};
	}

	if (
		typeof actualRange === 'number' &&
		parsedContentRange?.start !== actualRange
	) {
		if (actualRange === 0) {
			return {supportsContentRange: false};
		}

		throw new Error(
			`Range header (${actualRange}) does not match content-range header (${parsedContentRange?.start})`,
		);
	}

	if (
		actualRange !== null &&
		typeof actualRange !== 'number' &&
		(parsedContentRange?.start !== actualRange[0] ||
			parsedContentRange?.end !== actualRange[1])
	) {
		throw new Error(
			`Range header (${actualRange}) does not match content-range header (${parsedContentRange?.start})`,
		);
	}

	return {supportsContentRange: true};
};

export const fetchReader: ReaderInterface = {
	read: async ({src, range, controller}) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `fetchReader`');
		}

		const resolvedUrl = resolveUrl(src);

		const resolvedUrlString = resolvedUrl.toString();

		if (
			!resolvedUrlString.startsWith('https://') &&
			!resolvedUrlString.startsWith('blob:') &&
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

		const actualRange = range === null ? 0 : range;

		const asString =
			typeof resolvedUrl === 'string' ? resolvedUrl : resolvedUrl.pathname;

		const requestWithoutRange = asString.endsWith('.m3u8');

		const canLiveWithoutContentLength =
			asString.endsWith('.m3u8') || asString.endsWith('.ts');

		const headers: {
			Range?: string;
		} =
			actualRange === 0 && requestWithoutRange
				? {}
				: typeof actualRange === 'number'
					? {
							Range: `bytes=${actualRange}-`,
						}
					: {
							Range: `bytes=${`${actualRange[0]}-${actualRange[1]}`}`,
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

		const {supportsContentRange} = validateContentRangeAndDetectIfSupported({
			actualRange,
			parsedContentRange,
			statusCode: res.status,
		});

		controller._internals.signal.addEventListener(
			'abort',
			() => {
				ownController.abort(new MediaParserAbortError('Aborted by user'));
			},
			{once: true},
		);

		if (
			res.status.toString().startsWith('4') ||
			res.status.toString().startsWith('5')
		) {
			throw new Error(
				`Server returned status code ${res.status} for ${src} and range ${actualRange}`,
			);
		}

		const contentDisposition = res.headers.get('content-disposition');
		const name = contentDisposition?.match(/filename="([^"]+)"/)?.[1];
		const fallbackName = src.split('/').pop() as string;

		const {contentLength, needsContentRange, reader} = await getLengthAndReader(
			{
				canLiveWithoutContentLength,
				res,
				ownController,
				requestedWithoutRange: requestWithoutRange,
			},
		);

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
			contentType: res.headers.get('content-type'),
			name: name ?? fallbackName,
			supportsContentRange,
			needsContentRange,
		};
	},
};
