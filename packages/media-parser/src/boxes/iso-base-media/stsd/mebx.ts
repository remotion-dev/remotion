import type {BufferIterator} from '../../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../../options';
import type {AnySegment, IsoBaseMediaBox} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import type {BaseBox} from '../base-type';
import {parseIsoBaseMediaBoxes} from '../process-box';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: AnySegment[];
}

export const parseMebx = async ({
	iterator,
	offset,
	size,
	state,
	signal,
	fields,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
	state: ParserState;
	signal: AbortSignal | null;
	fields: Options<ParseMediaFields>;
}): Promise<MebxBox> => {
	// reserved, 6 bit
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();
	const boxes: IsoBaseMediaBox[] = [];

	const children = await parseIsoBaseMediaBoxes({
		iterator,
		maxBytes: iterator.counter.getOffset() - offset,
		allowIncompleteBoxes: false,
		initialBoxes: boxes,
		state,
		continueMdat: false,
		signal,
		logLevel: 'info',
		fields,
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
		children: boxes,
	};
};
