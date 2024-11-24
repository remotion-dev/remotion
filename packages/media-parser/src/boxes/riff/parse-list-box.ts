import type {BufferIterator} from '../../buffer-iterator';
import type {RiffBox} from './riff-box';

export const parseListBox = ({
	iterator,
	boxes,
	size,
}: {
	iterator: BufferIterator;
	boxes: RiffBox[];
	size: number;
}): RiffBox => {
	const counter = iterator.counter.getOffset();
	const listType = iterator.getByteString(4);
	iterator.discard(size - (iterator.counter.getOffset() - counter));

	return {
		type: 'list-box',
		listType,
	};
};
