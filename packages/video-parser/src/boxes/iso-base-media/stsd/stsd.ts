import type {BaseBox} from '../base-type';
import type {Sample} from './samples';
import {parseSamples} from './samples';

export interface StsdBox extends BaseBox {
	type: 'stsd-box';
	numberOfEntries: number;
	samples: Sample[];
}

export const parseStsd = (data: ArrayBuffer, offset: number): StsdBox => {
	let chunkOffset = 0;

	const view = new DataView(data);

	const size = view.getUint32(chunkOffset);
	if (size !== data.byteLength) {
		throw new Error(`Expected stsd size of ${data.byteLength}, got ${size}`);
	}

	chunkOffset += 4;

	const type = new TextDecoder().decode(
		data.slice(chunkOffset, chunkOffset + 4),
	);
	if (type !== 'stsd') {
		throw new Error(`Expected stsd type of stsd, got ${type}`);
	}

	chunkOffset += 4;

	const version = view.getUint8(chunkOffset);
	chunkOffset += 1;
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	// flags, we discard them
	data.slice(chunkOffset, chunkOffset + 3);
	chunkOffset += 3;

	const numberOfEntries = view.getUint32(chunkOffset);
	chunkOffset += 4;

	const boxes = parseSamples(data.slice(chunkOffset), offset + chunkOffset);

	if (boxes.length !== numberOfEntries) {
		throw new Error(
			`Expected ${numberOfEntries} sample descriptions, got ${boxes.length}`,
		);
	}

	return {
		type: 'stsd-box',
		boxSize: data.byteLength,
		offset,
		numberOfEntries,
		samples: boxes,
	};
};
