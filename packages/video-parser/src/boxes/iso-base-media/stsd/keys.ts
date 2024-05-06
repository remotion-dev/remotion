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

	const rest = data.subarray(chunkOffset);
	const restSize = rest.readInt32BE(0);
	chunkOffset += 4;
	const restType = rest
		.subarray(chunkOffset, chunkOffset + 4)
		.toString('utf-8');
	console.log(restType);

	console.log(restSize);

	return {
		type: 'keys-box',
		boxSize: data.length,
		offset,
	};
};
