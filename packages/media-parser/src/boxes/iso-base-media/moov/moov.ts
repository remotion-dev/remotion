import type {BufferIterator} from '../../../buffer-iterator';
import type {LogLevel} from '../../../log';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import type {BaseBox} from '../base-type';
import {parseIsoBaseMediaBoxes} from '../process-box';

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
	logLevel,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
	options: ParserContext;
	signal: AbortSignal | null;
	logLevel: LogLevel;
}): Promise<MoovBox> => {
	const children = await parseIsoBaseMediaBoxes({
		iterator,
		maxBytes: size - (iterator.counter.getOffset() - offset),
		allowIncompleteBoxes: false,
		initialBoxes: [],
		options,
		continueMdat: false,
		signal,
		logLevel,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		offset,
		boxSize: size,
		type: 'moov-box',
		children: children.segments.boxes,
	};
};
