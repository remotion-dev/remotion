import type {Box} from '../../parse-video';
import type {BaseBox} from './base-type';
import {parseBoxes} from './process-box';

export interface MdiaBox extends BaseBox {
	type: 'mdia-box';
	children: Box[];
}

export const parseMdia = (data: Buffer, offset: number): MdiaBox => {
	let chunkOffset = 0;

	const size = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	if (size !== data.length) {
		throw new Error(`Data size of version 0 is ${size}, got ${data.length}`);
	}

	const atom = data.subarray(chunkOffset, chunkOffset + 4);
	if (atom.toString() !== 'mdia') {
		throw new Error(`Expected mdia atom, got ${atom.toString('utf-8')}`);
	}

	chunkOffset += 4;

	const children = parseBoxes(data.subarray(chunkOffset), offset + chunkOffset);

	return {
		type: 'mdia-box',
		boxSize: data.length,
		offset,
		children,
	};
};
