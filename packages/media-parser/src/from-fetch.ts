import type {ReaderInterface} from './reader';

export const fetchReader: ReaderInterface = {
	read: async (src, range) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `webReader`');
		}

		const resolvedUrl =
			typeof window !== 'undefined' && typeof window.location !== 'undefined'
				? new URL(src, window.location.origin).toString()
				: src;

		if (
			!resolvedUrl.startsWith('https://') &&
			!resolvedUrl.startsWith('http://')
		) {
			return Promise.reject(
				new Error(
					resolvedUrl +
						' is not a URL - needs to start with http:// or https://. If you want to read a local file, pass `nodeReader` to parseMedia().',
				),
			);
		}

		const res = await fetch(resolvedUrl, {
			headers:
				range === null
					? {}
					: typeof range === 'number'
						? {
								Range: `bytes=${range}`,
							}
						: {
								Range: `bytes=${`${range[0]}-${range[1]}`}`,
							},
			// Disable Next.js caching
			cache: 'no-store',
		});
		if (!res.body) {
			throw new Error('No body');
		}

		const length = res.headers.get('content-length');

		const contentLength = length === null ? null : parseInt(length, 10);

		const reader = res.body.getReader();

		return {reader, contentLength};
	},
	getLength: async (src) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `webReader`');
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
