import {createReadStream} from 'fs';
import {stat} from 'node:fs/promises';
import {Readable} from 'stream';
import type {ReaderInterface} from './reader';

export const nodeReader: ReaderInterface = {
	read: (src, range) => {
		const stream = createReadStream(src, {
			start: range === null ? 0 : range[0],
			end: range === null ? Infinity : range[1],
		});
		return Promise.resolve(
			Readable.toWeb(
				stream,
			).getReader() as ReadableStreamDefaultReader<Uint8Array>,
		);
	},
	getLength: async (src) => {
		const stats = await stat(src);
		return stats.size;
	},
};
