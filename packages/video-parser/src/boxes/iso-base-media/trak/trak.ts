import type {IsoBaseMediaBox} from '../../../parse-video';
import type {BufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';
import {parseBoxes} from '../process-box';

export interface TrakBox extends BaseBox {
	type: 'trak-box';
	children: IsoBaseMediaBox[];
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

	const children = parseBoxes(
		data,
		size - (data.counter.getOffset() - offsetAtStart),
	);

	return {
		offset: offsetAtStart,
		boxSize: size,
		type: 'trak-box',
		children,
	};
};
