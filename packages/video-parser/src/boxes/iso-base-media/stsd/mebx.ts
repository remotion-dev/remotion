import type {IsoBaseMediaBox} from '../../../parse-video';
import {getArrayBufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: IsoBaseMediaBox[];
}

export const parseMebx = (data: ArrayBuffer, offset: number): MebxBox => {
	const iterator = getArrayBufferIterator(data, 0);
	const size = iterator.getUint32();
	if (size !== data.byteLength) {
		throw new Error(`Expected mebx size of ${data.byteLength}, got ${size}`);
	}

	const atom = iterator.getAtom();
	if (atom !== 'mebx') {
		throw new Error(`Expected mebx type of mebx, got ${atom}`);
	}

	// reserved, 6 bit
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();

	const children = parseBoxes(
		iterator.data.slice(iterator.counter.getOffset()),
		offset + iterator.counter.getOffset(),
	);

	return {
		type: 'mebx-box',
		boxSize: data.byteLength,
		offset,
		dataReferenceIndex,
		format: 'mebx',
		children,
	};
};
