import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MoovBox extends BaseBox {
	type: 'moov-box';
	children: AnySegment[];
}

export const parseMoov = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): MoovBox => {
	const children = parseBoxes({
		iterator,
		maxBytes: size - (iterator.counter.getOffset() - offset),
		allowIncompleteBoxes: false,
		initialBoxes: [],
		canSkipVideoData: true,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		offset,
		boxSize: size,
		type: 'moov-box',
		children: children.segments,
	};
};
