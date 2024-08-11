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

	if (child.status === 'incomplete') {
		throw new Error('Incomplete child');
	}

	return {
		type: 'seek-segment',
		seekId,
		child: child.segments[0] as MatroskaSegment,
	};
};
