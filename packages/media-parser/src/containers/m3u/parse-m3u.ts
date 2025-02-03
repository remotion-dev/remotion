import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {parseM3uDirective} from './parse-directive';
import type {M3uStructure} from './types';

export const parseM3u = ({
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

	if (line === '#EXTM3U') {
		structure.boxes.push({
			type: 'm3u-header',
		});

		return Promise.resolve(null);
	}

	if (line.startsWith('#')) {
		structure.boxes.push(parseM3uDirective(line));
		return Promise.resolve(null);
	}

	if (line.trim()) {
		structure.boxes.push({
			type: 'm3u-text-value',
			value: line,
		});
	}

	return Promise.resolve(null);
};
