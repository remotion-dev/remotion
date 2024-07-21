import type {BufferIterator} from '../../../buffer-iterator';
import type {AnySegment} from '../../../parse-result';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: AnySegment[];
}

export const parseTrak = (data: BufferIterator): TrakBox => {
	const offsetAtStart = data.counter.getOffset();
	const size = data.getUint32();

	if (size > data.bytesRemaining()) {
		throw new Error(`Don't have enough data to parse trak box yet`);
	}

	const atom = data.getAtom();
	if (atom !== 'trak') {
		throw new Error(`Expected trak atom, got ${atom}`);
	}

	const children = parseBoxes({
		iterator: data,
		maxBytes: size - (data.counter.getOffset() - offsetAtStart),
		allowIncompleteBoxes: false,
		initialBoxes: [],
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children: children.segments,
	};
};
