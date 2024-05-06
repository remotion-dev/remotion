import type {Box} from '../../../parse-video';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: Box[];
}

export const parseTrak = (data: Buffer, offset: number): TrakBox => {
	let chunkOffset = 0;

	const size = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	if (size !== data.length) {
		throw new Error(`Data size of version 0 is ${size}, got ${data.length}`);
	}

	const atom = data.subarray(chunkOffset, chunkOffset + 4);
	if (atom.toString() !== 'trak') {
		throw new Error(`Expected trak atom, got ${atom.toString('utf-8')}`);
	}

	chunkOffset += 4;

	const children = parseBoxes(data.subarray(chunkOffset), chunkOffset);

	return {
		offset,
		boxSize: data.length,
		type: 'trak-box',
		children,
	};
};
