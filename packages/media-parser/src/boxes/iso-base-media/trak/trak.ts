import type {BufferIterator} from '../../../buffer-iterator';
import type {LogLevel} from '../../../log';
import type {Options, ParseMediaFields} from '../../../options';
import type {AnySegment} from '../../../parse-result';
import type {ParserContext} from '../../../parser-context';
import type {BaseBox} from '../base-type';
import {parseIsoBaseMediaBoxes} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: AnySegment[];
}

export const parseTrak = async ({
	data,
	size,
	offsetAtStart,
	options,
	signal,
	logLevel,
	fields,
}: {
	data: BufferIterator;
	size: number;
	offsetAtStart: number;
	options: ParserContext;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<TrakBox> => {
	const children = await parseIsoBaseMediaBoxes({
		iterator: data,
		maxBytes: size - (data.counter.getOffset() - offsetAtStart),
		allowIncompleteBoxes: false,
		initialBoxes: [],
		options,
		continueMdat: false,
		signal,
		logLevel,
		fields,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children: children.segments.boxes,
	};
};
