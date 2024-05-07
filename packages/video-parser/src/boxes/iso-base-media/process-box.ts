import type {Box, BoxAndNext} from '../../parse-video';
import {fourByteToNumber, parseFtyp} from './ftype';
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
	data: ArrayBuffer;
	fileOffset: number;
}): BoxAndNext => {
	const boxSize = fourByteToNumber(data, 0);
	if (boxSize === 0) {
		throw new Error(`Expected box size of ${data.byteLength}, got ${boxSize}`);
	}

	const boxTypeBuffer = data.slice(4, 8);

	const boxType = new TextDecoder().decode(boxTypeBuffer);

	const sub = data.slice(0, boxSize);
	const next = data.slice(boxSize);

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

	if (boxType === 'moov') {
		return {
			box: parseMoov(sub, fileOffset),
			next,
			size: boxSize,
		};
	}

	if (boxType === 'trak') {
		return {
			box: parseTrak(sub, fileOffset),
			next,
			size: boxSize,
		};
	}

	const childArray = sub.slice(8, boxSize);

	const children =
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'dims' ||
		boxType === 'stsb'
			? parseBoxes(childArray, fileOffset)
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

export const parseBoxes = (data: ArrayBuffer, fileOffset: number): Box[] => {
	const boxes: Box[] = [];
	let remaining = data;
	let bytesConsumed = fileOffset;

	while (remaining.byteLength > 0) {
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
