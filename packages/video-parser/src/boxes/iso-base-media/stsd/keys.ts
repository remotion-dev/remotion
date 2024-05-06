import type {BaseBox} from '../base-type';

export interface KeysBox extends BaseBox {
	type: 'keys-box';
}

export const parseKeys = (data: Buffer, offset: number): KeysBox => {
	let chunkOffset = 0;

	const size = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;
	if (size !== data.length) {
		throw new Error(`Expected keys size of ${data.length}, got ${size}`);
	}

	const type = data.subarray(chunkOffset, chunkOffset + 4).toString('utf-8');
	chunkOffset += 4;
	if (type !== 'keys') {
		throw new Error(`Expected keys type of keys, got ${type}`);
	}

	return {
		type: 'keys-box',
		boxSize: data.length,
		offset,
	};
};
