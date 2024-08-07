import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: AnySegment[];
}

export const parseTrak = ({
	data,
	size,
	offsetAtStart,
	canSkipVideoData,
}: {
	data: BufferIterator;
	size: number;
	offsetAtStart: number;
	canSkipVideoData: boolean;
}): TrakBox => {
	const children = parseBoxes({
		iterator: data,
		maxBytes: size - (data.counter.getOffset() - offsetAtStart),
		allowIncompleteBoxes: false,
		initialBoxes: [],
		canSkipVideoData,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children: children.segments,
	};
};
