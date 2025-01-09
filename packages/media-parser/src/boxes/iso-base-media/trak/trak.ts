import type {BufferIterator} from '../../../buffer-iterator';
import type {LogLevel} from '../../../log';
import type {Options, ParseMediaFields} from '../../../options';
import type {AnySegment, IsoBaseMediaBox} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
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
	state: options,
	signal,
	logLevel,
	fields,
}: {
	data: BufferIterator;
	size: number;
	offsetAtStart: number;
	state: ParserState;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<TrakBox> => {
	const initialBoxes: IsoBaseMediaBox[] = [];
	const result = await parseIsoBaseMediaBoxes({
		iterator: data,
		maxBytes: size - (data.counter.getOffset() - offsetAtStart),
		allowIncompleteBoxes: false,
		initialBoxes,
		state: options,
		continueMdat: false,
		signal,
		logLevel,
		fields,
	});

	if (result.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children: initialBoxes,
	};
};
