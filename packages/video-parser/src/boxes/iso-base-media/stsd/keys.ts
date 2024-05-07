import type {BaseBox} from '../base-type';

export interface KeysBox extends BaseBox {
	type: 'keys-box';
}

export const parseKeys = (data: ArrayBuffer, offset: number): KeysBox => {
	let chunkOffset = 0;

	const view = new DataView(data);
	const size = view.getUint32(chunkOffset);
	chunkOffset += 4;
	if (size !== data.byteLength) {
		throw new Error(`Expected keys size of ${data.byteLength}, got ${size}`);
	}

	const type = new TextDecoder().decode(
		data.slice(chunkOffset, chunkOffset + 4),
	);
	chunkOffset += 4;
	if (type !== 'keys') {
		throw new Error(`Expected keys type of keys, got ${type}`);
	}

	return {
		type: 'keys-box',
		boxSize: data.byteLength,
		offset,
	};
};
