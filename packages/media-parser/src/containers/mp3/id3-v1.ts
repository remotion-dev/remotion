import type {BufferIterator} from '../../buffer-iterator';

export const parseID3V1 = (iterator: BufferIterator) => {
	if (iterator.bytesRemaining() < 128) {
		return;
	}

	// we drop ID3v1 because usually there is also ID3v2 and ID3v3 which are superior.
	// Better than have duplicated data.
	iterator.discard(128);
};
