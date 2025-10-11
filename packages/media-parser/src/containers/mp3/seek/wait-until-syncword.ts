import type {BufferIterator} from '../../../iterator/buffer-iterator';
import {isMp3PacketHeaderHereAndInNext} from '../parse-packet-header';

export const discardUntilSyncword = ({
	iterator,
}: {
	iterator: BufferIterator;
}) => {
	while (true) {
		const next2Bytes = iterator.getUint8();
		if (next2Bytes !== 0xff) {
			continue;
		}

		if (iterator.bytesRemaining() === 0) {
			break;
		}

		const nextByte = iterator.getUint8();
		const mask = 0xe0; // 1110 0000

		if ((nextByte & mask) !== mask) {
			continue;
		}

		iterator.counter.decrement(2);
		if (isMp3PacketHeaderHereAndInNext(iterator)) {
			break;
		} else {
			iterator.counter.increment(2);
		}
	}
};
