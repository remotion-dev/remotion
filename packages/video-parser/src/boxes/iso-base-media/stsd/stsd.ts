import type {BaseBox} from '../base-type';
import type {MebxBox} from './mebx';
import {parseMebx} from './mebx';

export interface StsdBox extends BaseBox {
	type: 'stsd-box';
	numberOfEntries: number;
	descriptions: StsdDescription[];
}

type UnknownBox = {
	type: 'unknown-box';
};

type StsdDescription = MebxBox | UnknownBox;

const consumeSampleDescriptions = (
	data: Buffer,
	offset: number,
): {
	description: StsdDescription;
	consumed: number;
} => {
	let chunkOffset = 0;

	const size = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;
	const type = data.subarray(chunkOffset, chunkOffset + 4).toString('utf-8');
	chunkOffset += 4;

	if (type === 'mebx') {
		return {
			description: parseMebx(data.subarray(0, size), offset),
			consumed: size,
		};
	}

	return {
		consumed: size,
		description: {
			type: 'unknown-box',
		},
	};
};

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

	let remaining = size - chunkOffset;

	const descriptions: StsdDescription[] = [];

	for (let i = 0; i < numberOfEntries; i++) {
		const result = consumeSampleDescriptions(
			data.subarray(chunkOffset),
			offset + chunkOffset,
		);
		remaining -= result.consumed;
		chunkOffset += result.consumed;
		descriptions.push(result.description);
	}

	if (descriptions.length !== numberOfEntries) {
		throw new Error(
			`Expected ${numberOfEntries} sample descriptions, got ${descriptions.length}`,
		);
	}

	if (remaining !== 0) {
		throw new Error(`Expected 0 bytes remaining, got ${remaining}`);
	}

	return {
		type: 'stsd-box',
		boxSize: data.length,
		offset,
		numberOfEntries,
		descriptions,
	};
};
