import type {BoxAndNext, IsoBaseMediaBox} from '../../parse-video';
import type {BufferIterator} from '../../read-and-increment-offset';
import {parseFtyp} from './ftype';
import {parseMoov} from './moov/moov';
import {parseMvhd} from './mvhd';
import {parseMebx} from './stsd/mebx';
import {parseStsd} from './stsd/stsd';
import {parseTkhd} from './tkhd';
import {parseTrak} from './trak/trak';

const processBoxAndSubtract = ({
	iterator,
	fileOffset,
}: {
	iterator: BufferIterator;
	fileOffset: number;
}): BoxAndNext => {
	const boxSize = iterator.getFourByteNumber();
	if (boxSize === 0) {
		throw new Error(`Expected box size of not 0, got ${boxSize}`);
	}

	const toDiscard = boxSize;

	const bytesRemaining = iterator.bytesRemaining();

	const boxType = iterator.getByteString(4);
	iterator.counter.decrement(8);

	if (bytesRemaining < boxSize) {
		return {
			type: 'incomplete',
		};
	}

	if (boxType === 'ftyp') {
		const box = parseFtyp(iterator);
		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'mvhd') {
		const box = parseMvhd(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'tkhd') {
		const box = parseTkhd(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'stsd') {
		const box = parseStsd(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'mebx') {
		const box = parseMebx(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'moov') {
		const box = parseMoov(iterator);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	if (boxType === 'trak') {
		const box = parseTrak(iterator, fileOffset);

		return {
			type: 'complete',
			box,
			size: boxSize,
		};
	}

	const children =
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'dims' ||
		boxType === 'stsb'
			? parseBoxes(iterator, boxSize - 8)
			: [];

	iterator.discard(toDiscard);

	return {
		type: 'complete',
		box: {
			type: 'regular-box',
			boxType,
			boxSize,
			children,
			offset: fileOffset,
		},
		size: boxSize,
	};
};

export const parseBoxes = (
	iterator: BufferIterator,
	maxBytes: number,
): IsoBaseMediaBox[] => {
	const boxes: IsoBaseMediaBox[] = [];
	const initialOffset = iterator.counter.getOffset();

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const result = processBoxAndSubtract({
			iterator,
			fileOffset: iterator.counter.getOffset(),
		});
		if (result.type === 'incomplete') {
			break;
		}

		boxes.push(result.box);
	}

	return boxes;
};
