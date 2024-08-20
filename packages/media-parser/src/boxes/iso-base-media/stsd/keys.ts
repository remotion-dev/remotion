import {getArrayBufferIterator} from '../../../buffer-iterator';
import type {BaseBox} from '../base-type';

export interface KeysBox extends BaseBox {
	type: 'keys-box';
}

export const parseKeys = (data: Uint8Array, offset: number): KeysBox => {
	const iterator = getArrayBufferIterator(data, data.byteLength);
	const size = iterator.getUint32();
	if (size !== data.byteLength) {
		throw new Error(`Expected keys size of ${data.byteLength}, got ${size}`);
	}

	const atom = iterator.getAtom();
	if (atom !== 'keys') {
		throw new Error(`Expected keys type of keys, got ${atom}`);
	}

	iterator.destroy();

	return {
		type: 'keys-box',
		boxSize: data.byteLength,
		offset,
	};
};
