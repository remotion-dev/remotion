import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {parseId3} from './id3';
import {parseMpegHeader} from './parse-mpeg-header';

export const parseMp3 = (iterator: BufferIterator): Promise<ParseResult> => {
	while (iterator.bytesRemaining() > 3) {
		const bytes = iterator.getSlice(3);
		if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
			const id3 = parseId3(iterator);
			console.log({id3});
		}

		if (bytes[0] === 0xff) {
			console.log('mpeg audio header');
			iterator.counter.decrement(3);
			const frame = parseMpegHeader(iterator);
			console.log({frame});
		}
	}
};
