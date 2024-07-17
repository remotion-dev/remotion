import type {IsoBaseMediaBox} from '../../../parse-video';
import {getArrayBufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: IsoBaseMediaBox[];
}

export const parseTrak = (data: ArrayBuffer, offset: number): TrakBox => {
	const iterator = getArrayBufferIterator(data);
	const size = iterator.getUint32();

	if (size !== data.byteLength) {
		throw new Error(
			`Data size of version 0 is ${size}, got ${data.byteLength}`,
		);
	}

	const atom = iterator.getAtom();
	if (atom !== 'trak') {
		throw new Error(`Expected trak atom, got ${atom}`);
	}

	const children = parseBoxes(
		data.slice(iterator.counter.getOffset()),
		offset + iterator.counter.getOffset(),
	);

	return {
		offset,
		boxSize: data.byteLength,
		type: 'trak-box',
		children,
	};
};
