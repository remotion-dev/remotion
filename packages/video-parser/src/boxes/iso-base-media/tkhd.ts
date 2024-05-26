import {getArrayBufferIterator} from '../../read-and-increment-offset';
import type {BaseBox} from './base-type';
import type {ThreeDMatrix} from './mvhd';
import {toUnixTimestamp} from './to-date';

export interface TkhdBox extends BaseBox {
	type: 'tkhd-box';
	alternateGroup: number;
	creationTime: number | null;
	duration: number;
	modificationTime: number | null;
	trackId: number;
	version: number;
	layer: number;
	volume: number;
	matrix: ThreeDMatrix;
	width: number;
	height: number;
}

export const parseTkhd = (data: ArrayBuffer, fileOffset: number): TkhdBox => {
	const iterator = getArrayBufferIterator(data, 0);

	const size = iterator.getUint32();

	const atom = iterator.getAtom();
	if (atom !== 'tkhd') {
		throw new Error(`Expected tkhd atom, got ${atom}`);
	}

	if (size !== 92) {
		throw new Error(`Expected tkhd size of version 0 to be 92, got ${size}`);
	}

	const version = iterator.getUint8();
	if (version !== 0) {
		throw new Error(`Unsupported TKHD version ${version}`);
	}

	// Flags, we discard them
	iterator.discard(3);

	const creationTime = iterator.getUint32();

	const modificationTime = iterator.getUint32();

	const trackId = iterator.getUint32();

	// reserved
	iterator.discard(4);

	const duration = iterator.getUint32();

	// reserved 2
	iterator.discard(4);

	// reserved 3
	iterator.discard(4);

	const layer = iterator.getUint16();

	const alternateGroup = iterator.getUint16();

	const volume = iterator.getUint16();

	// reserved 4
	iterator.discard(2);

	const matrix = [
		iterator.getUint32(),
		iterator.getUint32(),
		iterator.getUint32(),
		iterator.getUint32(),
		iterator.getUint32(),
		iterator.getUint32(),
		iterator.getUint32(),
		iterator.getUint32(),
		iterator.getUint32(),
	];

	const width = iterator.getUint32();

	const height = iterator.getUint32();

	return {
		offset: fileOffset,
		boxSize: data.byteLength,
		type: 'tkhd-box',
		creationTime: toUnixTimestamp(creationTime),
		modificationTime: toUnixTimestamp(modificationTime),
		trackId,
		duration,
		layer,
		alternateGroup,
		volume,
		matrix: matrix as ThreeDMatrix,
		width,
		height,
		version,
	};
};
