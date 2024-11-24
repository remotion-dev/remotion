import type {BufferIterator} from '../../buffer-iterator';
import {parseFmtBox} from './parse-fmt-box';
import {parseListBox} from './parse-list-box';
import type {RiffBox, RiffRegularBox} from './riff-box';

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
		return parseListBox({iterator, boxes, size});
	}

	iterator.discard(size);

	const box: RiffRegularBox = {
		type: 'riff-box',
		size,
		id,
	};

	return box;
};
