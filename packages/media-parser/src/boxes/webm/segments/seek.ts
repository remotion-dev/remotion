import type {BufferIterator} from '../../../buffer-iterator';
import type {ParserContext} from '../../../parser-context';
import type {MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';

export type SeekSegment = {
	type: 'seek-segment';
	children: MatroskaSegment[];
};

export const parseSeekSegment = async (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): Promise<SeekSegment> => {
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
		type: 'seek-segment',
		children: children.segments as MatroskaSegment[],
	};
};

export type SeekIdSegment = {
	type: 'seek-id-segment';
	seekId: string;
};

export const parseSeekIdSegment = (iterator: BufferIterator): SeekIdSegment => {
	const seekId = iterator.getMatroskaSegmentId();
	if (seekId === null) {
		throw new Error('Not enough bytes to parse seek id');
	}

	return {
		type: 'seek-id-segment',
		seekId,
	};
};
