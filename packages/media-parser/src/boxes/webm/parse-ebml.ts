import type {BufferIterator} from '../../buffer-iterator';
import type {PossibleEbml} from './segments/all-segments';
import {ebmlMap} from './segments/all-segments';

export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export const parseEbml = (iterator: BufferIterator): Prettify<PossibleEbml> => {
	const hex = iterator.getMatroskaSegmentId();
	if (hex === null) {
		throw new Error(
			'Not enough bytes left to parse EBML - this should not happen',
		);
	}

	const hasInMap = ebmlMap[hex as keyof typeof ebmlMap];
	if (!hasInMap) {
		throw new Error(
			`Don't know how to parse EBML hex ID ${JSON.stringify(hex)}`,
		);
	}

	const size = iterator.getVint();
	if (size === null) {
		throw new Error(
			'Not enough bytes left to parse EBML - this should not happen',
		);
	}

	if (hasInMap.type === 'uint') {
		const value = iterator.getUint(size);

		return {type: hasInMap.name, value};
	}

	if (hasInMap.type === 'string') {
		const value = iterator.getByteString(size);

		return {
			type: hasInMap.name,
			value,
		};
	}

	if (hasInMap.type === 'float') {
		const value = size === 4 ? iterator.getFloat32() : iterator.getFloat64();

		return {
			type: hasInMap.name,
			value,
		};
	}

	if (hasInMap.type === 'void') {
		iterator.discard(size);

		return {
			type: hasInMap.name,
			value: undefined,
		};
	}

	if (hasInMap.type === 'hex-string') {
		return {
			type: hasInMap.name,
			value:
				'0x' +
				[...iterator.getSlice(size)]
					.map((b) => b.toString(16).padStart(2, '0'))
					.join(''),
		};
	}

	if (hasInMap.type === 'children') {
		const children: PossibleEbml[] = [];
		const startOffset = iterator.counter.getOffset();

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const value = parseEbml(iterator);
			children.push(value);
			const offsetNow = iterator.counter.getOffset();

			if (offsetNow - startOffset > size) {
				throw new Error(
					`Offset ${offsetNow - startOffset} is larger than the length of the hex ${size}`,
				);
			}

			if (offsetNow - startOffset === size) {
				break;
			}
		}

		return {type: hasInMap.name, value: children};
	}

	// @ts-expect-error
	throw new Error(`Unknown segment type ${hasInMap.type}`);
};
