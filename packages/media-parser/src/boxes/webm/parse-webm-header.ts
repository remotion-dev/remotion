import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {expectSegment} from './segments';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = (counter: BufferIterator): ParseResult => {
	counter.discard(4);
	const length = counter.getVint();

	if (length !== 31) {
		throw new Error(`Expected header length 31, got ${length}`);
	}

	// Discard header for now
	counter.discard(31);

	return {status: 'done', segments: [expectSegment(counter)]};
};
