import type {BufferIterator} from '../../buffer-iterator';
import type {IsftBox} from './riff-box';

export const parseIsft = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): IsftBox => {
	const {expectNoMoreBytes} = iterator.startBox(size);
	const software = iterator.getByteString(size - 1, false);
	const last = iterator.getUint8();
	if (last !== 0) {
		throw new Error(`Expected 0 byte, got ${last}`);
	}

	expectNoMoreBytes();

	return {
		type: 'isft-box',
		software,
	};
};
