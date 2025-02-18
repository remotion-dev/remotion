import {createReadStream, statSync} from 'fs';
import {sep} from 'path';
import {Readable} from 'stream';
import type {ReaderInterface} from './reader';

export const nodeReader: ReaderInterface = {
	read: ({src, range, controller}) => {
		if (typeof src !== 'string') {
			throw new Error('src must be a string when using `nodeReader`');
		}

		const ownController = new AbortController();

		const stream = createReadStream(src, {
			start: range === null ? 0 : typeof range === 'number' ? range : range[0],
			end:
				range === null
					? Infinity
					: typeof range === 'number'
						? Infinity
						: range[1],
			signal: ownController.signal,
		});

		controller._internals.signal.addEventListener(
			'abort',
			() => {
				ownController.abort();
			},
			{once: true},
		);

		const stats = statSync(src);

		const reader = Readable.toWeb(
			stream,
		).getReader() as ReadableStreamDefaultReader<Uint8Array>;

		if (controller) {
			controller._internals.signal.addEventListener(
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
					ownController.abort();
				},
			},
			contentLength: stats.size,
			contentType: null,
			name: src.split(sep).pop() as string,
			supportsContentRange: true,
			needsContentRange: true,
		});
	},
};
