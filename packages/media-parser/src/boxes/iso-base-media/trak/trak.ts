import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: AnySegment[];
}

export const parseTrak = async ({
	data,
	size,
	offsetAtStart,
	options,
}: {
	data: BufferIterator;
	size: number;
	offsetAtStart: number;
	options: ParserContext;
}): Promise<TrakBox> => {
	const children = await parseBoxes({
		iterator: data,
		maxBytes: size - (data.counter.getOffset() - offsetAtStart),
		allowIncompleteBoxes: false,
		initialBoxes: [],
		options,
		continueMdat: false,
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
