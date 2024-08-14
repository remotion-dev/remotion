import type {BufferIterator} from '../../../buffer-iterator';
import type {ParserContext} from '../../../parser-context';
import {type MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';

export type SeekHeadSegment = {
	type: 'seek-head-segment';
	children: MatroskaSegment[];
	length: number;
};

export const parseSeekHeadSegment = async (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): Promise<SeekHeadSegment> => {
	const children = await expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
		parserContext,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete children');
	}

	return {
		type: 'seek-head-segment',
		length,
		children: children.segments as MatroskaSegment[],
	};
};
