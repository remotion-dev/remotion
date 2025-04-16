import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {Idx1Entry, RiffBox} from './riff-box';

export const parseIdx1 = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): RiffBox => {
	const box = iterator.startBox(size);
	const offset = iterator.counter.getOffset();
	const entries: Idx1Entry[] = [];
	while (iterator.counter.getOffset() < offset + size) {
		const chunkId = iterator.getByteString(4, false);
		const flags = iterator.getUint32Le();
		const moffset = iterator.getUint32Le();
		const msize = iterator.getUint32Le();

		entries.push({
			flags,
			id: chunkId,
			offset: moffset,
			size: msize,
		});
	}

	box.expectNoMoreBytes();

	return {
		type: 'idx1-box',
		entries,
	};
};
