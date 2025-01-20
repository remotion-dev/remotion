import type {ParserState} from '../../state/parser-state';
import type {IsoBaseMediaBox} from './base-media-box';
import {processBox} from './process-box';

export const getIsoBaseMediaChildren = async ({
	state,
	size,
}: {
	state: ParserState;
	size: number;
}): Promise<IsoBaseMediaBox[]> => {
	const boxes: IsoBaseMediaBox[] = [];
	const {iterator} = state;
	const initial = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < size + initial) {
		const parsed = await processBox(state);
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
