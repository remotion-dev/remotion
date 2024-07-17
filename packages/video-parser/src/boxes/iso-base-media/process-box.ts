import type {BoxAndNext, IsoBaseMediaBox} from '../../parse-video';
import type {BufferIterator} from '../../read-and-increment-offset';
import {getArrayBufferIterator} from '../../read-and-increment-offset';
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
	const offset = iterator.counter.getOffset();
	const boxSize = iterator.getFourByteNumber();
	if (boxSize === 0) {
		throw new Error(`Expected box size of not 0, got ${boxSize}`);
	}

	const toDiscard = boxSize;

	const boxType = iterator.getByteString(4);
	iterator.counter.decrement(8);

	const boxBuffer = iterator.slice(offset, boxSize + offset);
	if (boxBuffer.byteLength !== boxSize) {
		return {
			type: 'incomplete',
		};
	}

	const next = iterator.slice(boxSize + offset);

	if (boxType === 'ftyp') {
		const box = parseFtyp(boxBuffer, fileOffset);
		iterator.discard(toDiscard);
		return {
			type: 'complete',
			box,
			next,
			size: boxSize,
		};
	}

	if (boxType === 'mvhd') {
		const box = parseMvhd(boxBuffer, fileOffset);
		iterator.discard(toDiscard);

		return {
			type: 'complete',
			box,
			next,
			size: boxSize,
		};
	}

	if (boxType === 'tkhd') {
		const box = parseTkhd(boxBuffer, fileOffset);
		iterator.discard(toDiscard);

		return {
			type: 'complete',
			box,
			next,
			size: boxSize,
		};
	}

	if (boxType === 'stsd') {
		const box = parseStsd(boxBuffer, fileOffset);
		iterator.discard(toDiscard);

		return {
			type: 'complete',
			box,
			next,
			size: boxSize,
		};
	}

	if (boxType === 'mebx') {
		const box = parseMebx(boxBuffer, fileOffset);
		iterator.discard(toDiscard);

		return {
			type: 'complete',
			box,
			next,
			size: boxSize,
		};
	}

	if (boxType === 'moov') {
		const box = parseMoov(boxBuffer, fileOffset);
		iterator.discard(toDiscard);

		return {
			type: 'complete',
			box,
			next,
			size: boxSize,
		};
	}

	if (boxType === 'trak') {
		const box = parseTrak(boxBuffer, fileOffset);
		iterator.discard(toDiscard);

		return {
			type: 'complete',
			box,
			next,
			size: boxSize,
		};
	}

	const childArray = boxBuffer.slice(8, boxSize);

	const children =
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'dims' ||
		boxType === 'stsb'
			? parseBoxes(childArray, fileOffset)
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
		next,
		size: boxSize,
	};
};

export const parseBoxes = (
	data: Uint8Array,
	fileOffset: number,
): IsoBaseMediaBox[] => {
	const boxes: IsoBaseMediaBox[] = [];
	let remaining = data;
	let bytesConsumed = fileOffset;

	const iterator = getArrayBufferIterator(data);

	while (remaining.byteLength > 0) {
		const result = processBoxAndSubtract({
			iterator,
			fileOffset: bytesConsumed,
		});
		if (result.type === 'incomplete') {
			break;
		}

		remaining = result.next;
		boxes.push(result.box);
		bytesConsumed = result.box.offset + result.size;
	}

	return boxes;
};
