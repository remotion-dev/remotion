import {createReadStream} from 'fs';
import type {BaseBox} from './boxes/iso-base-media/base-type';
import type {FtypBox} from './boxes/iso-base-media/ftype';
import {fourByteToNumber, parseFtyp} from './boxes/iso-base-media/ftype';
import type {MvhdBox} from './boxes/iso-base-media/mvhd';
import {parseMvhd} from './boxes/iso-base-media/mvhd';

interface RegularBox extends BaseBox {
	boxType: string;
	boxSize: number;
	children: Box[];
	offset: number;
	type: 'regular-box';
}

export type Box = RegularBox | FtypBox | MvhdBox;

const processBoxAndSubtract = ({
	data,
	fileOffset,
}: {
	data: Buffer;
	fileOffset: number;
}): BoxAndNext => {
	const boxSize = fourByteToNumber(data, 0);
	const boxType = data.subarray(4, 8).toString('utf-8');

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

	const children =
		boxType === 'moov' ||
		boxType === 'trak' ||
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
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

type BoxAndNext = {
	box: Box;
	next: Buffer;
	size: number;
};

const isoBaseMediaMp4Pattern = Buffer.from('ftyp');

const parseBoxes = (data: Buffer, fileOffset: number): Box[] => {
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

const matchesPattern = (pattern: Buffer) => {
	return (data: Buffer) => {
		return pattern.every((value, index) => data[index] === value);
	};
};

export const parseVideo = async (
	src: string,
	bytes: number,
): Promise<Box[]> => {
	const stream = createReadStream(
		src,
		Number.isFinite(bytes) ? {end: bytes - 1} : {},
	);
	const data = await new Promise<Buffer>((resolve, reject) => {
		const buffers: Buffer[] = [];

		stream.on('data', (chunk) => {
			buffers.push(chunk as Buffer);
		});

		stream.on('end', () => {
			resolve(Buffer.concat(buffers));
		});

		stream.on('error', (err) => {
			reject(err);
		});
	});

	if (matchesPattern(isoBaseMediaMp4Pattern)(data.subarray(4, 8))) {
		return parseBoxes(data, 0);
	}

	return [];
};
