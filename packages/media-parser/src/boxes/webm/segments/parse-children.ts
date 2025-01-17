import type {BufferIterator} from '../../../buffer-iterator';
import type {Options, ParseMediaFields} from '../../../options';
import type {ParserState} from '../../../state/parser-state';
import {expectSegment} from '../segments';
import type {PossibleEbml} from './all-segments';

export const expectChildren = async ({
	iterator,
	length,
	state,
	startOffset,
	fields,
}: {
	iterator: BufferIterator;
	length: number;
	state: ParserState;
	startOffset: number;
	fields: Options<ParseMediaFields>;
}): Promise<PossibleEbml[]> => {
	const children: PossibleEbml[] = [];
	while (iterator.counter.getOffset() < startOffset + length) {
		if (iterator.bytesRemaining() === 0) {
			break;
		}

		const child = await expectSegment({
			iterator,
			state,
			fields,
		});
		if (child) {
			children.push(child);
		}
	}

	return children;
};
