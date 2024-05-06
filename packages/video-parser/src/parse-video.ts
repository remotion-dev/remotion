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

const getExtraDataFromBox = ({
	box,
	type,
	offset,
}: {
	box: Buffer;
	type: string;
	offset: number;
}): Box[] => {
	if (type === 'ftyp') {
		return [parseFtyp(box, offset)];
	}

	if (type === 'mvhd') {
		return [parseMvhd(box, offset)];
	}

	if (
		type === 'moov' ||
		type === 'trak' ||
		type === 'mdia' ||
		type === 'minf' ||
		type === 'stbl' ||
		type === 'stsb'
	) {
		return parseBoxes(box.subarray(8));
	}

	return [];
};

const processBoxAndSubtract = (data: Buffer, offset: number): BoxAndNext => {
	const boxSize = fourByteToNumber(data, 0);
	const boxType = data.subarray(4, 8).toString('utf-8');

	const next = data.subarray(boxSize);

	const children = getExtraDataFromBox({
		box: data.subarray(0, boxSize),
		type: boxType,
		offset,
	});

	return {
		box: {
			type: 'regular-box',
			boxType,
			boxSize,
			children,
			offset: offset + boxSize,
		},
		next,
	};
};

type BoxAndNext = {
	box: Box;
	next: Buffer;
};

const isoBaseMediaMp4Pattern = Buffer.from('ftyp');

const parseBoxes = (data: Buffer): Box[] => {
	const boxes: Box[] = [];
	let remaining = data;
	let bytesConsumed = 0;

	while (remaining.length > 0) {
		const {next, box} = processBoxAndSubtract(remaining, bytesConsumed);

		remaining = next;
		boxes.push(box);
		bytesConsumed = box.offset;
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
		return parseBoxes(data);
	}

	return [];
};
