import type {BufferIterator} from '../../../buffer-iterator';
import type {LogLevel} from '../../../log';
import type {Options, ParseMediaFields} from '../../../options';
import type {AnySegment, IsoBaseMediaBox} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
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
	state,
	signal,
	logLevel,
	fields,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
	state: ParserState;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<MoovBox> => {
	const boxes: IsoBaseMediaBox[] = [];

	const children = await parseIsoBaseMediaBoxes({
		iterator,
		maxBytes: size - (iterator.counter.getOffset() - offset),
		allowIncompleteBoxes: false,
		initialBoxes: boxes,
		state,
		continueMdat: false,
		signal,
		logLevel,
		fields,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		offset,
		boxSize: size,
		type: 'moov-box',
		children: boxes,
	};
};
