import type {Box} from '../../../parse-video';
import {getArrayBufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MoovBox extends BaseBox {
	type: 'moov-box';
	children: Box[];
}

export const parseMoov = (data: ArrayBuffer, offset: number): MoovBox => {
	const iterator = getArrayBufferIterator(data, 0);
	const size = iterator.getUint32();
	if (size !== data.byteLength) {
		throw new Error(`Expected moov size of ${data.byteLength}, got ${size}`);
	}

	const atom = iterator.getAtom();
	if (atom !== 'moov') {
		throw new Error(`Expected moov type of moov, got ${atom}`);
	}

	const children = parseBoxes(
		iterator.data.slice(iterator.counter.getOffset()),
		offset + iterator.counter.getOffset(),
	);

	return {
		offset,
		boxSize: data.byteLength,
		type: 'moov-box',
		children,
	};
};
