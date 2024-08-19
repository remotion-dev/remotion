import type {BufferIterator} from '../../buffer-iterator';
import type {Ebml, EbmlParsed} from './segments/all-segments';

type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export const parseEbml = <T extends Ebml>(
	segment: T,
	iterator: BufferIterator,
): Prettify<EbmlParsed<T>> => {
	const hex = iterator.getMatroskaSegmentId();
	const size = iterator.getVint();

	if (segment.type === 'uint-8') {
		const value = iterator.getUint8();
		console.log(hex, size, value);
	}

	if (segment.type === 'string') {
		const value = iterator.getByteString(size);
		console.log(hex, size, value);
	}

	if (segment.type === 'children') {
		const children = [];
		for (const child of segment.children) {
			const value = parseEbml(child, iterator);
			children.push(value);
		}

		console.log(children);
	}

	return {segment};
};
