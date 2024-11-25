import type {BufferIterator} from '../../buffer-iterator';
import type {RiffStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {parseRiffBody} from './parse-box';
import type {RiffBox} from './riff-box';

export const parseListBox = ({
	iterator,
	size,
	options,
}: {
	iterator: BufferIterator;
	size: number;
	options: ParserContext;
}): RiffBox => {
	const counter = iterator.counter.getOffset();
	const listType = iterator.getByteString(4);

	if (listType === 'movi') {
		throw new Error('should not be handled here');
	}

	const structure: RiffStructure = {
		type: 'riff',
		boxes: [],
	};
	const result = parseRiffBody({
		structure,
		iterator,
		maxOffset: counter + size,
		options,
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
