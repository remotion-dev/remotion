import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {parseM3u8Text} from './parse-m3u8-text';
import type {M3uStructure} from './types';

export const parseM3uManifest = ({
	iterator,
	structure,
	contentLength,
}: {
	iterator: BufferIterator;
	structure: M3uStructure;
	contentLength: number;
}): Promise<ParseResult> => {
	const start = iterator.startCheckpoint();
	const line = iterator.readUntilLineEnd();
	if (iterator.counter.getOffset() > contentLength) {
		throw new Error('Unexpected end of file');
	}

	if (line === null) {
		start.returnToCheckpoint();
		return Promise.resolve(null);
	}

	parseM3u8Text(line.trim(), structure.boxes);

	return Promise.resolve(null);
};
