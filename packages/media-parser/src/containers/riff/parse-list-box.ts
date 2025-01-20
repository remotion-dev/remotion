import type {ParserState} from '../../state/parser-state';
import {expectRiffBox} from './expect-riff-box';
import type {RiffBox} from './riff-box';

export const parseListBox = async ({
	size,
	state,
}: {
	size: number;
	state: ParserState;
}): Promise<RiffBox> => {
	const {iterator} = state;
	const counter = iterator.counter.getOffset();
	const listType = iterator.getByteString(4, false);

	if (listType === 'movi') {
		throw new Error('should not be handled here');
	}

	const boxes: RiffBox[] = [];
	const maxOffset = counter + size;

	while (iterator.counter.getOffset() < maxOffset) {
		const result = await expectRiffBox(state);
		if (result.box !== null) {
			boxes.push(result.box);
		} else {
			throw new Error('Unexpected result');
		}
	}

	return {
		type: 'list-box',
		listType,
		children: boxes,
	};
};
