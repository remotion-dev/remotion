import type {BufferIterator} from '../../../buffer-iterator';
import type {ParserState} from '../../../state/parser-state';
import type {BaseBox} from '../base-type';
import type {Sample} from './samples';
import {parseIsoFormatBoxes} from './samples';

export interface StsdBox extends BaseBox {
	type: 'stsd-box';
	numberOfEntries: number;
	samples: Sample[];
}

export const parseStsd = async ({
	iterator,
	offset,
	size,
	state,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
	state: ParserState;
}): Promise<StsdBox> => {
	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	// flags, we discard them
	iterator.discard(3);

	const numberOfEntries = iterator.getUint32();

	const bytesRemainingInBox = size - (iterator.counter.getOffset() - offset);

	const boxes = await parseIsoFormatBoxes({
		iterator,
		maxBytes: bytesRemainingInBox,
		state,
	});

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
