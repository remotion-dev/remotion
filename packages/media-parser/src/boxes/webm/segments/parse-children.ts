import type {BufferIterator} from '../../../buffer-iterator';
import type {ParseResult} from '../../../parse-result';
import type {MatroskaSegment} from '../segments';
import {expectSegment} from '../segments';

type WrapChildren = (segments: MatroskaSegment[]) => MatroskaSegment;

export const expectChildren = ({
	iterator,
	length,
	initialChildren,
	wrap,
}: {
	iterator: BufferIterator;
	length: number;
	initialChildren: MatroskaSegment[];
	wrap: WrapChildren | null;
}): ParseResult => {
	const children: MatroskaSegment[] = [...initialChildren];
	const startOffset = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < startOffset + length) {
		const blockOffset = iterator.counter.getOffset();
		if (iterator.bytesRemaining() === 0) {
			break;
		}

		const child = expectSegment(iterator);

		if (child.status === 'incomplete') {
			const endOffset = iterator.counter.getOffset();
			const bytesRead = endOffset - blockOffset;
			iterator.counter.decrement(bytesRead);
			return {
				status: 'incomplete',
				segments: wrap ? [wrap(children)] : children,
				continueParsing: () => {
					return expectChildren({
						iterator,
						length: length - (blockOffset - startOffset),
						initialChildren: children,
						wrap,
					});
				},
				skipTo: null,
			};
		}

		for (const segment of child.segments) {
			children.push(segment as MatroskaSegment);
			if (segment.type === 'unknown-segment') {
				break;
			}
		}
	}

	return {
		status: 'done',
		segments: wrap ? [wrap(children)] : children,
	};
};
