import type {IsoBaseMediaBox} from '../../../parse-video';
import type {BufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MoovBox extends BaseBox {
	type: 'moov-box';
	children: IsoBaseMediaBox[];
}

export const parseMoov = (iterator: BufferIterator): MoovBox => {
	const bytesRemaining = iterator.bytesRemaining();
	const offset = iterator.counter.getOffset();
	const size = iterator.getUint32();
	if (bytesRemaining < size) {
		throw new Error(
			`Expected moov size of at least ${bytesRemaining}, got ${size}`,
		);
	}

	const atom = iterator.getAtom();
	if (atom !== 'moov') {
		throw new Error(`Expected moov type of moov, got ${atom}`);
	}

	const children = parseBoxes({
		iterator,
		maxBytes: size - 8,
		allowIncompleteBoxes: false,
	});

	return {
		offset,
		boxSize: size,
		type: 'moov-box',
		children,
	};
};
