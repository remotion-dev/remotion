import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: AnySegment[];
}

export const parseMebx = ({
	iterator,
	offset,
	size,
	options,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
	options: ParserContext;
}): MebxBox => {
	// reserved, 6 bit
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();

	const children = parseBoxes({
		iterator,
		maxBytes: iterator.counter.getOffset() - offset,
		allowIncompleteBoxes: false,
		initialBoxes: [],
		options,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		type: 'mebx-box',
		boxSize: size,
		offset,
		dataReferenceIndex,
		format: 'mebx',
		children: children.segments,
	};
};
