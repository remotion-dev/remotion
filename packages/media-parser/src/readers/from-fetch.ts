/* eslint-disable eqeqeq */
/* eslint-disable no-negated-condition */
/* eslint-disable no-eq-null */
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

const validateContentRangeAndDetectIfSupported = (
	actualRange: number | [number, number],
	parsedContentRange: ParsedContentRange | null,
): {supportsContentRange: boolean} => {
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
	read: async (src, range, signal) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `fetchReader`');
		}

		const resolvedUrl =
			typeof window !== 'undefined' && typeof window.location !== 'undefined'
				? new URL(src, window.location.origin).toString()
				: src;

		if (
			!resolvedUrl.startsWith('https://') &&
			!resolvedUrl.startsWith('blob:') &&
			!resolvedUrl.startsWith('http://')
		) {
			return Promise.reject(
				new Error(
					resolvedUrl +
						' is not a URL - needs to start with http:// or https:// or blob:. If you want to read a local file, pass `reader: nodeReader` to parseMedia().',
				),
			);
		}

		const controller = new AbortController();

		const cache =
			typeof navigator !== 'undefined' &&
			navigator.userAgent.includes('Cloudflare-Workers')
				? undefined
				: // Disable Next.js caching
					'no-store';

		const actualRange = range === null ? 0 : range;

		const res = await fetch(resolvedUrl, {
			headers:
				typeof actualRange === 'number'
					? {
							Range: `bytes=${actualRange}-`,
						}
					: {
							Range: `bytes=${`${actualRange[0]}-${actualRange[1]}`}`,
						},
			signal: controller.signal,
			cache,
		});

		const contentRange = res.headers.get('content-range');
		const parsedContentRange = contentRange
			? parseContentRange(contentRange)
			: null;

		const {supportsContentRange} = validateContentRangeAndDetectIfSupported(
			actualRange,
			parsedContentRange,
		);

		signal?.addEventListener(
			'abort',
			() => {
				controller.abort();
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

		if (!res.body) {
			throw new Error('No body');
		}

		const length = res.headers.get('content-length');

		const contentLength = length === null ? null : parseInt(length, 10);
		const contentDisposition = res.headers.get('content-disposition');
		const name = contentDisposition?.match(/filename="([^"]+)"/)?.[1];

		const fallbackName = src.split('/').pop();

		const reader = res.body.getReader();

		if (signal) {
			signal.addEventListener(
				'abort',
				() => {
					reader.cancel().catch(() => {
						// Prevent unhandled rejection in Firefox
					});
				},
				{once: true},
			);
		}

		return {
			reader: {
				reader,
				abort: () => {
					controller.abort();
				},
			},
			contentLength,
			name: name ?? (fallbackName as string),
			supportsContentRange,
		};
	},
	getLength: async (src) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `fetchReader`');
		}

		const res = await fetch(src, {
			method: 'HEAD',
		});
		if (!res.body) {
			throw new Error('No body');
		}

		const length = res.headers.get('content-length');
		if (!length) {
			throw new Error('No content-length');
		}

		return parseInt(length, 10);
	},
};
