import type {BufferIterator} from '../../../buffer-iterator';
import type {MatroskaSegment} from '../segments';
import {expectSegment} from '../segments';

export type SeekSegment = {
	type: 'seek-segment';
	seekId: string;
	child: MatroskaSegment;
};

export const parseSeekSegment = (iterator: BufferIterator): SeekSegment => {
	const seekId = iterator.getMatroskaSegmentId();
	const child = expectSegment(iterator);

	return {
		type: 'seek-segment',
		seekId,
		child,
	};
};
