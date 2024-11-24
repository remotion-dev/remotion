import type {BufferIterator} from '../../buffer-iterator';
import {parseRiffBox} from './parse-riff-box';
import type {RiffBox} from './riff-box';

type RiffResult =
	| {
			type: 'incomplete';
	  }
	| {
			type: 'complete';
			box: RiffBox;
	  };

export const expectRiffBox = ({
	iterator,
	boxes,
}: {
	iterator: BufferIterator;
	boxes: RiffBox[];
}): RiffResult => {
	const ckId = iterator.getByteString(4);
	const ckSize = iterator.getUint32Le();

	// TODO: Add capability to read partially
	if (iterator.bytesRemaining() < ckSize) {
		iterator.counter.decrement(8);
		return {
			type: 'incomplete',
		};
	}

	return {
		type: 'complete',
		box: parseRiffBox({id: ckId, iterator, size: ckSize, boxes}),
	};
};
