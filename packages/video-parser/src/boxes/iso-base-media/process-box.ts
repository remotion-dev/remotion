import type {Box} from '../../parse-video';
import {parseDims} from './dims';
import {fourByteToNumber, parseFtyp} from './ftype';
import {parseMvhd} from './mvhd';
import {parseMebx} from './stsd/mebx';
import {parseStsd} from './stsd/stsd';
import {parseTkhd} from './tkhd';

type BoxAndNext = {
	box: Box;
	next: Buffer;
	size: number;
};

const processBoxAndSubtract = ({
	data,
	fileOffset,
}: {
	data: Buffer;
	fileOffset: number;
}): BoxAndNext => {
	const boxSize = fourByteToNumber(data, 0);
	if (boxSize === 0) {
		throw new Error(`Expected box size of ${data.length}, got ${boxSize}`);
	}

	const boxTypeBuffer = data.subarray(4, 8);

	const boxType = boxTypeBuffer.toString('utf-8');

	const sub = data.subarray(0, boxSize);
	const next = data.subarray(boxSize);

	if (boxType === 'ftyp') {
		return {
			box: parseFtyp(sub, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'mvhd') {
		return {
			box: parseMvhd(sub, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'tkhd') {
		return {
			box: parseTkhd(sub, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'dims') {
		return {
			box: parseDims(sub, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'stsd') {
		return {
			box: parseStsd(sub, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'mebx') {
		return {
			box: parseMebx(sub, fileOffset),
			next,
			size: boxSize,
		};
	}

	const children =
		boxType === 'moov' ||
		boxType === 'trak' ||
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'dims' ||
		boxType === 'stsb'
			? parseBoxes(sub.subarray(8), fileOffset)
			: [];

	return {
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

export const parseBoxes = (data: Buffer, fileOffset: number): Box[] => {
	const boxes: Box[] = [];
	let remaining = data;
	let bytesConsumed = fileOffset;

	while (remaining.length > 0) {
		const {next, box, size} = processBoxAndSubtract({
			data: remaining,
			fileOffset: bytesConsumed,
		});

		remaining = next;
		boxes.push(box);
		bytesConsumed = box.offset + size;
	}

	return boxes;
};
