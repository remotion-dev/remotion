import type {BufferIterator} from '../../buffer-iterator';
import type {RiffStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseRiffBody} from './parse-box';
import type {RiffBox} from './riff-box';

export const parseListBox = async ({
	iterator,
	size,
	state,
}: {
	iterator: BufferIterator;
	size: number;
	state: ParserState;
}): Promise<RiffBox> => {
	const counter = iterator.counter.getOffset();
	const listType = iterator.getByteString(4, false);

	if (listType === 'movi') {
		throw new Error('should not be handled here');
	}

	const structure: RiffStructure = {
		type: 'riff',
		boxes: [],
	};
	const result = await parseRiffBody({
		structure,
		iterator,
		maxOffset: counter + size,
		state,
	});

	if (result.status === 'incomplete') {
		throw new Error(`Should only parse complete boxes (${listType})`);
	}

	return {
		type: 'list-box',
		listType,
		children: structure.boxes,
	};
};
