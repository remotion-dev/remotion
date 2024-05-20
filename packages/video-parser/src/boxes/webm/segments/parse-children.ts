import type {BufferIterator} from '../../../read-and-increment-offset';
import type {MatroskaSegment} from '../segments';
import {expectSegment} from '../segments';

export const expectChildren = (
	iterator: BufferIterator,
	length: number,
): MatroskaSegment[] => {
	const children: MatroskaSegment[] = [];
	const startOffset = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < startOffset + length) {
		const child = expectSegment(iterator);
		children.push(child);
		if (child.type === 'unknown-segment') {
			break;
		}
	}

	return children;
};
