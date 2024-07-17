import {getArrayBufferIterator} from '../../../read-and-increment-offset';
import type {BaseBox} from '../base-type';

export interface KeysBox extends BaseBox {
	type: 'keys-box';
}

export const parseKeys = (data: ArrayBuffer, offset: number): KeysBox => {
	const iterator = getArrayBufferIterator(data);
	const size = iterator.getUint32();
	if (size !== data.byteLength) {
		throw new Error(`Expected keys size of ${data.byteLength}, got ${size}`);
	}

	const atom = iterator.getAtom();
	if (atom !== 'keys') {
		throw new Error(`Expected keys type of keys, got ${atom}`);
	}

	return {
		type: 'keys-box',
		boxSize: data.byteLength,
		offset,
	};
};
