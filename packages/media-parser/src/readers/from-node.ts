import {createReadStream, statSync} from 'fs';
import {sep} from 'path';
import {Readable} from 'stream';
import type {ReaderInterface} from './reader';

export const nodeReader: ReaderInterface = {
	read: (src, range, signal) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `nodeReader`');
		}

		const controller = new AbortController();

		const stream = createReadStream(src, {
			start: range === null ? 0 : typeof range === 'number' ? range : range[0],
			end:
				range === null
					? Infinity
					: typeof range === 'number'
						? Infinity
						: range[1],
			signal: controller.signal,
		});

		signal?.addEventListener(
			'abort',
			() => {
				controller.abort();
			},
			{once: true},
		);

		const stats = statSync(src);

		const reader = Readable.toWeb(
			stream,
		).getReader() as ReadableStreamDefaultReader<Uint8Array>;

		if (signal) {
			signal.addEventListener(
				'abort',
				() => {
					reader.cancel().catch(() => {});
				},
				{once: true},
			);
		}

		return Promise.resolve({
			reader: {
				reader,
				abort: () => {
					controller.abort();
				},
			},
			contentLength: stats.size,
			contentType: null,
			name: src.split(sep).pop() as string,
			supportsContentRange: true,
		});
	},
	getLength: (src) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `nodeReader`');
		}

		const stats = statSync(src);
		return Promise.resolve(stats.size);
	},
};
