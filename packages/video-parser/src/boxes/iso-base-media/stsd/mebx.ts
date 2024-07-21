import type {IsoBaseMediaBox} from '../../../parse-video';
import type {BufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: IsoBaseMediaBox[];
}

export const parseMebx = (iterator: BufferIterator): MebxBox => {
	const offset = iterator.counter.getOffset();
	const size = iterator.getUint32();

	const atom = iterator.getAtom();
	if (atom !== 'mebx') {
		throw new Error(`Expected mebx type of mebx, got ${atom}`);
	}

	// reserved, 6 bit
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();

	const children = parseBoxes({
		iterator,
		maxBytes: iterator.counter.getOffset() - offset,
		allowIncompleteBoxes: false,
	});

	return {
		type: 'mebx-box',
		boxSize: size,
		offset,
		dataReferenceIndex,
		format: 'mebx',
		children,
	};
};
