import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MoovBox extends BaseBox {
	type: 'moov-box';
	children: AnySegment[];
}

export const parseMoov = async ({
	iterator,
	offset,
	size,
	options,
	signal,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
	options: ParserContext;
	signal: AbortSignal | null;
}): Promise<MoovBox> => {
	const children = await parseBoxes({
		iterator,
		maxBytes: size - (iterator.counter.getOffset() - offset),
		allowIncompleteBoxes: false,
		initialBoxes: [],
		options,
		continueMdat: false,
		littleEndian: false,
		signal,
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
