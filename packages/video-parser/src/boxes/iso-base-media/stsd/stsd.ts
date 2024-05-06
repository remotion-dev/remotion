import type {Box} from '../../../parse-video';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface StsdBox extends BaseBox {
	type: 'stsd-box';
	numberOfEntries: number;
	children: Box[];
}

export const parseStsd = (data: Buffer, offset: number): StsdBox => {
	let chunkOffset = 0;

	const size = data.readUInt32BE(chunkOffset);
	if (size !== data.length) {
		throw new Error(`Expected stsd size of ${data.length}, got ${size}`);
	}

	chunkOffset += 4;

	const type = data.subarray(chunkOffset, chunkOffset + 4).toString('utf-8');
	if (type !== 'stsd') {
		throw new Error(`Expected stsd type of stsd, got ${type}`);
	}

	chunkOffset += 4;

	const version = data.readUInt8(chunkOffset);
	chunkOffset += 1;
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	// flags, we discard them
	data.subarray(chunkOffset, chunkOffset + 3);
	chunkOffset += 3;

	const numberOfEntries = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	const boxes = parseBoxes(data.subarray(chunkOffset), offset + chunkOffset);

	if (boxes.length !== numberOfEntries) {
		throw new Error(
			`Expected ${numberOfEntries} sample descriptions, got ${boxes.length}`,
		);
	}

	return {
		type: 'stsd-box',
		boxSize: data.length,
		offset,
		numberOfEntries,
		children: boxes,
	};
};
