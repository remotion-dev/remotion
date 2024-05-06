import type {Box} from '../../../parse-video';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: Box[];
}

export const parseMebx = (data: Buffer, offset: number): MebxBox => {
	let chunkOffset = 0;

	const size = data.readUInt32BE(chunkOffset);
	if (size !== data.length) {
		throw new Error(`Expected mebx size of ${data.length}, got ${size}`);
	}

	chunkOffset += 4;
	const type = data.subarray(chunkOffset, chunkOffset + 4).toString('utf-8');
	if (type !== 'mebx') {
		throw new Error(`Expected mebx type of mebx, got ${type}`);
	}

	chunkOffset += 4;

	// reserved, 6 bit
	chunkOffset += 6;

	const dataReferenceIndex = data.readUInt16BE(chunkOffset);
	chunkOffset += 2;

	const rest = data.subarray(chunkOffset);

	const children = parseBoxes(rest, offset + chunkOffset);

	return {
		type: 'mebx-box',
		boxSize: data.length,
		offset,
		dataReferenceIndex,
		format: 'mebx',
		children,
	};
};
