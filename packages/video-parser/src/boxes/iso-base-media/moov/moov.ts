import type {Box} from '../../../parse-video';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MoovBox extends BaseBox {
	type: 'moov-box';
	children: Box[];
}

export const parseMoov = (data: Buffer, offset: number): MoovBox => {
	let chunkOffset = 0;
	const size = data.readUInt32BE(0);
	chunkOffset += 4;
	if (size !== data.length) {
		throw new Error(`Expected moov size of ${data.length}, got ${size}`);
	}

	const type = data.subarray(chunkOffset, chunkOffset + 4).toString('utf-8');
	chunkOffset += 4;
	if (type !== 'moov') {
		throw new Error(`Expected moov type of moov, got ${type}`);
	}

	const children = parseBoxes(data.subarray(chunkOffset), offset + chunkOffset);

	return {
		offset,
		boxSize: data.length,
		type: 'moov-box',
		children,
	};
};
