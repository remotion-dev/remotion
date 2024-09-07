import {createReadStream} from 'fs';
import {stat} from 'node:fs/promises';
import {Readable} from 'stream';
import type {ReaderInterface} from './reader';

export const nodeReader: ReaderInterface = {
	read: async (src, range, signal) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `nodeReader`');
		}

		const stream = createReadStream(src, {
			start: range === null ? 0 : typeof range === 'number' ? range : range[0],
			end:
				range === null
					? Infinity
					: typeof range === 'number'
						? Infinity
						: range[1],
			signal,
		});
		const stats = await stat(src);

		const reader = Readable.toWeb(
			stream,
		).getReader() as ReadableStreamDefaultReader<Uint8Array>;

		if (signal) {
			signal.addEventListener(
				'abort',
				() => {
					reader.cancel();
				},
				{once: true},
			);
		}

		return {
			reader,
			contentLength: stats.size,
			name: src.split('/').pop() as string,
		};
	},
	getLength: async (src) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `nodeReader`');
		}

		const stats = await stat(src);
		return stats.size;
	},
};
