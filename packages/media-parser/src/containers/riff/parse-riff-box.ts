import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {ParserState} from '../../state/parser-state';
import {parseAvih} from './parse-avih';
import {parseIdx1} from './parse-idx1';
import {parseIsft} from './parse-isft';
import {parseListBox} from './parse-list-box';
import {parseStrh} from './parse-strh';
import type {RiffBox, RiffRegularBox} from './riff-box';

export const parseRiffBox = ({
	size,
	id,
	iterator,
	stateIfExpectingSideEffects,
}: {
	size: number;
	id: string;
	iterator: BufferIterator;
	stateIfExpectingSideEffects: ParserState | null;
}): Promise<RiffBox> => {
	if (id === 'LIST') {
		return parseListBox({
			size,
			iterator,
			stateIfExpectingSideEffects,
		});
	}

	if (id === 'ISFT') {
		return Promise.resolve(parseIsft({iterator, size}));
	}

	if (id === 'avih') {
		return Promise.resolve(parseAvih({iterator, size}));
	}

	if (id === 'strh') {
		return Promise.resolve(parseStrh({iterator, size}));
	}

	if (id === 'idx1') {
		return Promise.resolve(parseIdx1({iterator, size}));
	}

	iterator.discard(size);

	const box: RiffRegularBox = {
		type: 'riff-box',
		size,
		id,
	};

	return Promise.resolve(box);
};
