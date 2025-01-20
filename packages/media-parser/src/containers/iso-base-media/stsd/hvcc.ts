import type {BufferIterator} from '../../../buffer-iterator';
import {getHvc1CodecString} from '../../../make-hvc1-codec-strings';

export interface HvccBox {
	type: 'hvcc-box';
	privateData: Uint8Array;
	configurationString: string;
}

export const parseHvcc = ({
	data,
	size,
	offset,
}: {
	data: BufferIterator;
	size: number;
	offset: number;
}): HvccBox => {
	const privateData = data.getSlice(size - 8);
	data.counter.decrement(size - 8);

	const constraintString = getHvc1CodecString(data);

	const remaining = size - (data.counter.getOffset() - offset);
	data.discard(remaining);

	return {
		type: 'hvcc-box',
		privateData,
		configurationString: constraintString,
	};
};
