import type {BufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';
import type {Sample} from './samples';
import {parseSamples} from './samples';

export interface StsdBox extends BaseBox {
	type: 'stsd-box';
	numberOfEntries: number;
	samples: Sample[];
}

export const parseStsd = (iterator: BufferIterator): StsdBox => {
	const offset = iterator.counter.getOffset();
	const size = iterator.getUint32();
	if (size < iterator.bytesRemaining()) {
		throw new Error(
			`Expected stsd size of at least ${iterator.bytesRemaining()}, got ${size}`,
		);
	}

	const type = iterator.getAtom();
	if (type !== 'stsd') {
		throw new Error(`Expected stsd type of stsd, got ${type}`);
	}

	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	// flags, we discard them
	iterator.discard(3);

	const numberOfEntries = iterator.getUint32();

	const boxes = parseSamples(iterator, iterator.counter.getOffset() - offset);

	if (boxes.length !== numberOfEntries) {
		throw new Error(
			`Expected ${numberOfEntries} sample descriptions, got ${boxes.length}`,
		);
	}

	return {
		type: 'stsd-box',
		boxSize: size,
		offset,
		numberOfEntries,
		samples: boxes,
	};
};
