import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {ParserState} from '../../state/parser-state';
import {expectRiffBox, postProcessRiffBox} from './expect-riff-box';
import type {RiffBox} from './riff-box';

export const parseListBox = async ({
	size,
	iterator,
	stateIfExpectingSideEffects,
}: {
	size: number;
	iterator: BufferIterator;
	stateIfExpectingSideEffects: ParserState | null;
}): Promise<RiffBox> => {
	const counter = iterator.counter.getOffset();
	const listType = iterator.getByteString(4, false);

	if (listType === 'movi') {
		throw new Error('should not be handled here');
	}

	const boxes: RiffBox[] = [];
	const maxOffset = counter + size;

	while (iterator.counter.getOffset() < maxOffset) {
		const box = await expectRiffBox({
			iterator,
			stateIfExpectingSideEffects,
		});

		if (box === null) {
			throw new Error('Unexpected result');
		}

		if (stateIfExpectingSideEffects) {
			await postProcessRiffBox(stateIfExpectingSideEffects, box);
		}

		boxes.push(box);
	}

	return {
		type: 'list-box',
		listType,
		children: boxes,
	};
};
