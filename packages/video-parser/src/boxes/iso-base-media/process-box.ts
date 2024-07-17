import type {BoxAndNext, IsoBaseMediaBox} from '../../parse-video';
import {getArrayBufferIterator} from '../../read-and-increment-offset';
import {parseFtyp} from './ftype';
import {parseMoov} from './moov/moov';
import {parseMvhd} from './mvhd';
import {parseMebx} from './stsd/mebx';
import {parseStsd} from './stsd/stsd';
import {parseTkhd} from './tkhd';
import {parseTrak} from './trak/trak';

const processBoxAndSubtract = ({
	data,
	fileOffset,
}: {
	data: Uint8Array;
	fileOffset: number;
}): BoxAndNext => {
	const iterator = getArrayBufferIterator(data);

	const boxSize = iterator.getFourByteNumber();
	if (boxSize === 0) {
		throw new Error(`Expected box size of ${data.byteLength}, got ${boxSize}`);
	}

	const boxTypeBuffer = data.slice(4, 8);

	const boxType = new TextDecoder().decode(boxTypeBuffer);

	const boxBuffer = data.slice(0, boxSize);
	const next = data.slice(boxSize);

	if (boxBuffer.byteLength !== boxSize) {
		return {
			type: 'incomplete',
		};
	}

	if (boxType === 'ftyp') {
		return {
			type: 'complete',
			box: parseFtyp(boxBuffer, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'mvhd') {
		return {
			type: 'complete',
			box: parseMvhd(boxBuffer, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'tkhd') {
		return {
			type: 'complete',
			box: parseTkhd(boxBuffer, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'stsd') {
		return {
			type: 'complete',
			box: parseStsd(boxBuffer, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'mebx') {
		return {
			type: 'complete',
			box: parseMebx(boxBuffer, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'moov') {
		const box = parseMoov(boxBuffer, fileOffset);

		return {
			type: 'complete',
			box,
			next,
			size: boxSize,
		};
	}

	if (boxType === 'trak') {
		return {
			type: 'complete',
			box: parseTrak(boxBuffer, fileOffset),
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

	while (remaining.byteLength > 0) {
		const result = processBoxAndSubtract({
			data: remaining,
			fileOffset: bytesConsumed,
		});
		if (result.type === 'incomplete') {
			return boxes;
		}

		remaining = result.next;
		boxes.push(result.box);
		bytesConsumed = result.box.offset + result.size;
	}

	return boxes;
};
