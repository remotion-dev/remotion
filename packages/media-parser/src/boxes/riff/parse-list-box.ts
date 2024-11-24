import type {BufferIterator} from '../../buffer-iterator';
import type {RiffStructure} from '../../parse-result';
import {parseRiffBody} from './parse-box';
import type {RiffBox} from './riff-box';

export const parseListBox = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): RiffBox => {
	const counter = iterator.counter.getOffset();
	const listType = iterator.getByteString(4);

	if (listType === 'movi') {
		iterator.discard(size - (iterator.counter.getOffset() - counter));
		return {
			type: 'list-box',
			listType: 'movi',
			children: [],
		};
	}

	const structure: RiffStructure = {
		type: 'riff',
		boxes: [],
	};
	const result = parseRiffBody({
		structure,
		iterator,
		maxOffset: counter + size,
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
