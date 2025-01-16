import type {BufferIterator} from '../../buffer-iterator';
import type {IsoBaseMediaBox} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {processBox} from './process-box';

export const getIsoBaseMediaChildren = async ({
	iterator,
	state,
	size,
}: {
	iterator: BufferIterator;
	state: ParserState;
	size: number;
}): Promise<IsoBaseMediaBox[]> => {
	const boxes: IsoBaseMediaBox[] = [];
	const initial = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < size + initial) {
		const parsed = await processBox({
			iterator,
			state,
		});
		if (!parsed.box) {
			throw new Error('Expected box');
		}

		boxes.push(parsed.box);
	}

	if (iterator.counter.getOffset() > size + initial) {
		throw new Error(
			`read too many bytes - size: ${size}, read: ${iterator.counter.getOffset() - initial}. initial offset: ${initial}`,
		);
	}

	return boxes;
};
