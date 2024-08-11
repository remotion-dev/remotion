import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import {expectSegment} from './segments';
import type {OnSimpleBlock} from './segments/track-entry';

// Parsing according to https://darkcoding.net/software/reading-mediarecorders-webm-opus-output/
export const parseWebm = (
	counter: BufferIterator,
	onSimpleBlock: OnSimpleBlock,
): ParseResult => {
	counter.discard(4);
	const length = counter.getVint();

	if (length !== 31 && length !== 35) {
		throw new Error(`Expected header length 31 or 25, got ${length}`);
	}

	// Discard header for now
	counter.discard(length);

	return expectSegment(counter, onSimpleBlock);
};
