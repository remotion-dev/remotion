import type {BufferIterator} from '../../buffer-iterator';
import {parseAvih} from './parse-avih';
import {parseFmtBox} from './parse-fmt-box';
import {parseListBox} from './parse-list-box';
import {parseStrh} from './parse-strh';
import type {RiffBox, RiffRegularBox} from './riff-box';
import {parseStrf} from './strf';

export const parseRiffBox = ({
	iterator,
	size,
	id,
	boxes,
}: {
	iterator: BufferIterator;
	size: number;
	id: string;
	boxes: RiffBox[];
}): RiffBox => {
	if (id === 'fmt') {
		return parseFmtBox({iterator, boxes, size});
	}

	if (id === 'LIST') {
		return parseListBox({iterator, size});
	}

	if (id === 'avih') {
		return parseAvih({iterator, size});
	}

	if (id === 'strh') {
		return parseStrh({iterator, size});
	}

	if (id === 'strf') {
		return parseStrf({iterator, size, boxes});
	}

	iterator.discard(size);

	const box: RiffRegularBox = {
		type: 'riff-box',
		size,
		id,
	};

	return box;
};
