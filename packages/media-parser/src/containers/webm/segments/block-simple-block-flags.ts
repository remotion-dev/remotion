import type {BufferIterator} from '../../../buffer-iterator';
import {matroskaElements} from './all-segments';

type BlockFlags = {
	invisible: boolean;
	lacing: number;
	keyframe: boolean | null;
};

export const parseBlockFlags = (
	iterator: BufferIterator,
	type:
		| (typeof matroskaElements)['Block']
		| (typeof matroskaElements)['SimpleBlock'],
): BlockFlags => {
	if (type === matroskaElements.Block) {
		iterator.startReadingBits();
		// Reserved
		iterator.getBits(4);
		const invisible = Boolean(iterator.getBits(1));
		const lacing = iterator.getBits(2);
		// unused
		iterator.getBits(1);
		iterator.stopReadingBits();
		return {
			invisible,
			lacing,
			keyframe: null,
		};
	}

	if (type === matroskaElements.SimpleBlock) {
		iterator.startReadingBits();

		const keyframe = Boolean(iterator.getBits(1));
		// Reserved
		iterator.getBits(3);
		const invisible = Boolean(iterator.getBits(1));
		const lacing = iterator.getBits(2);
		iterator.getBits(1);

		iterator.stopReadingBits();

		return {
			invisible,
			lacing,
			keyframe,
		};
	}

	throw new Error('Unexpected type');
};
