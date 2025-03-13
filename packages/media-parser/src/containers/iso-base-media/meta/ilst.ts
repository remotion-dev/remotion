import type {BufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

type IlstEntry = {
	index: number;
	wellKnownType: number;
	type: string;
	value: Value;
};

export type Value =
	| {
			type: 'text';
			value: string;
	  }
	| {
			type: 'number';
			value: number;
	  }
	| {type: 'unknown'; value: unknown};

export interface IlstBox extends BaseBox {
	type: 'ilst-box';
	entries: IlstEntry[];
}

// https://developer.apple.com/documentation/quicktime-file-format/well-known_types
const parseFromWellKnownType = (
	wellKnownType: number,
	iterator: BufferIterator,
	size: number,
): Value => {
	if (wellKnownType === 1) {
		const value = iterator.getByteString(size, false);
		return {type: 'text', value};
	}

	if (wellKnownType === 21) {
		if (size === 1) {
			return {type: 'number', value: iterator.getInt8()};
		}

		if (size === 2) {
			return {type: 'number', value: iterator.getInt16()};
		}

		if (size === 3) {
			return {type: 'number', value: iterator.getInt24()};
		}

		if (size === 4) {
			return {type: 'number', value: iterator.getInt32()};
		}

		if (size === 8) {
			return {type: 'number', value: Number(iterator.getInt64())};
		}

		throw new Error(`Weird size for number ${size}`);
	}

	if (wellKnownType === 22) {
		if (size === 1) {
			return {type: 'number', value: iterator.getUint8()};
		}

		if (size === 2) {
			return {type: 'number', value: iterator.getUint16()};
		}

		if (size === 3) {
			return {type: 'number', value: iterator.getUint24()};
		}

		if (size === 4) {
			return {type: 'number', value: iterator.getUint32()};
		}

		throw new Error(`Weird size for number ${size}`);
	}

	if (wellKnownType === 23) {
		if (size === 4) {
			return {type: 'number', value: iterator.getFloat32()};
		}

		if (size === 8) {
			return {type: 'number', value: iterator.getFloat64()};
		}

		throw new Error(`Weird size for number ${size}`);
	}

	iterator.discard(size);
	return {type: 'unknown', value: null};
};

export const parseIlstBox = ({
	iterator,
	size,
	offset,
}: {
	iterator: BufferIterator;
	size: number;
	offset: number;
}): IlstBox => {
	const box = iterator.startBox(size - 8);

	const entries: IlstEntry[] = [];
	while (iterator.counter.getOffset() < size + offset) {
		// metadata size
		const metadataSize = iterator.getUint32();
		const index = iterator.getUint32();
		// "skip" as a number
		if (index === 1936419184) {
			iterator.discard(metadataSize - 8);
			continue;
		}

		const innerSize = iterator.getUint32();
		const type = iterator.getAtom();
		const typeIndicator = iterator.getUint8();
		if (typeIndicator !== 0) {
			throw new Error('Expected type indicator to be 0');
		}

		const wellKnownType = iterator.getUint24();
		iterator.discard(4);
		const value = parseFromWellKnownType(
			wellKnownType,
			iterator,
			innerSize - 16,
		);
		entries.push({index, type, wellKnownType, value});
	}

	box.discardRest();

	return {
		type: 'ilst-box',
		boxSize: size,
		offset,
		entries,
	};
};
