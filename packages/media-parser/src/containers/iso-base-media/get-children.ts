import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {ParserState} from '../../state/parser-state';
import type {IsoBaseMediaBox} from './base-media-box';
import {processBox} from './process-box';

export const getIsoBaseMediaChildren = async ({
	state,
	size,
	iterator,
}: {
	state: ParserState;
	size: number;
	iterator: BufferIterator;
}): Promise<IsoBaseMediaBox[]> => {
	const boxes: IsoBaseMediaBox[] = [];
	const initial = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < size + initial) {
		const parsed = await processBox(state);
		if (!parsed) {
			throw new Error('Expected box');
		}

		boxes.push(parsed);
	}

	if (iterator.counter.getOffset() > size + initial) {
		throw new Error(
			`read too many bytes - size: ${size}, read: ${iterator.counter.getOffset() - initial}. initial offset: ${initial}`,
		);
	}

	return boxes;
};
