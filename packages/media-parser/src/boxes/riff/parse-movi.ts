import type {BufferIterator} from '../../buffer-iterator';
import type {RiffResult} from './expect-riff-box';

export const parseMovi = ({
	iterator,
	maxOffset,
}: {
	iterator: BufferIterator;
	maxOffset: number;
}): RiffResult => {
	while (iterator.counter.getOffset() < maxOffset) {
		if (iterator.bytesRemaining() < 8) {
			return {
				type: 'incomplete',
				continueParsing: () => {
					return parseMovi({iterator, maxOffset});
				},
			};
		}

		const ckId = iterator.getByteString(4);
		const ckSize = iterator.getUint32Le();
		console.log({ckId, ckSize});
		iterator.discard(ckSize);

		// Discard added zeroes
		while (
			iterator.counter.getOffset() < maxOffset &&
			iterator.bytesRemaining() > 0
		) {
			if (iterator.getUint8() !== 0) {
				iterator.counter.decrement(1);
				break;
			}
		}
	}

	if (iterator.counter.getOffset() === maxOffset) {
		return {
			type: 'complete',
			box: {
				type: 'movi-box',
			},
		};
	}

	if (iterator.counter.getOffset() > maxOffset) {
		throw new Error('Oops, this should not happen!');
	}

	return {
		type: 'incomplete',
		continueParsing: () => {
			return parseMovi({iterator, maxOffset});
		},
	};
};
