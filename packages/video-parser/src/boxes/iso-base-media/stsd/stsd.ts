import {getArrayBufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';
import type {Sample} from './samples';
import {parseSamples} from './samples';

export interface StsdBox extends BaseBox {
	type: 'stsd-box';
	numberOfEntries: number;
	samples: Sample[];
}

export const parseStsd = (data: ArrayBuffer, offset: number): StsdBox => {
	const view = getArrayBufferIterator(data);

	const size = view.getUint32();
	if (size !== data.byteLength) {
		throw new Error(`Expected stsd size of ${data.byteLength}, got ${size}`);
	}

	const type = view.getAtom();
	if (type !== 'stsd') {
		throw new Error(`Expected stsd type of stsd, got ${type}`);
	}

	const version = view.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported STSD version ${version}`);
	}

	// flags, we discard them
	view.discard(3);

	const numberOfEntries = view.getUint32();

	const boxes = parseSamples(
		view.slice(view.counter.getOffset()),
		offset + view.counter.getOffset(),
	);

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
