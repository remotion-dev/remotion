import type {BufferIterator} from '../../buffer-iterator';
import type {RiffBox, RiffRegularBox} from './riff-box';

type RiffResult =
	| {
			type: 'incomplete';
	  }
	| {
			type: 'complete';
			box: RiffBox;
	  };

export const expectRiffBox = (iterator: BufferIterator): RiffResult => {
	const ckId = iterator.getByteString(4);
	const ckSize = iterator.getUint32Le();
	if (iterator.bytesRemaining() < ckSize) {
		iterator.counter.decrement(8);
		return {
			type: 'incomplete',
		};
	}

	iterator.discard(ckSize);

	const box: RiffRegularBox = {
		type: 'riff-box',
		size: ckSize,
		id: ckId,
	};

	return {
		type: 'complete',
		box,
	};
};
