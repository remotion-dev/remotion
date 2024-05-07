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
	let chunkOffset = 0;

	const view = new DataView(data);

	const size = view.getUint32(chunkOffset);
	chunkOffset += 4;
	const atom = data.slice(chunkOffset, chunkOffset + 4);
	const atomAsString = new TextDecoder().decode(atom);
	if (atomAsString !== 'tkhd') {
		throw new Error(`Expected tkhd atom, got ${atomAsString}`);
	}

	chunkOffset += 4;
	const version = view.getUint8(chunkOffset);
	if (version !== 0) {
		throw new Error(`Unsupported TKHD version ${version}`);
	}

	chunkOffset += 1;

	if (size !== 92) {
		throw new Error(`Expected tkhd size of version 0 to be 92, got ${size}`);
	}

	// Flags, we discard them
	data.slice(chunkOffset, chunkOffset + 3);
	chunkOffset += 3;

	const creationTime = view.getUint32(chunkOffset);
	chunkOffset += 4;

	const modificationTime = view.getUint32(chunkOffset);
	chunkOffset += 4;

	const trackId = view.getUint32(chunkOffset);
	chunkOffset += 4;

	// reserved
	chunkOffset += 4;

	const duration = view.getUint32(chunkOffset);
	chunkOffset += 4;

	// reserved 2
	chunkOffset += 4;

	// reserved 3
	chunkOffset += 4;

	const layer = view.getUint16(chunkOffset);
	chunkOffset += 2;

	const alternateGroup = view.getUint16(chunkOffset);
	chunkOffset += 2;

	const volume = view.getUint16(chunkOffset);
	chunkOffset += 2;

	// reserved 4
	chunkOffset += 2;

	const matrix = [
		view.getUint32(chunkOffset),
		view.getUint32(chunkOffset + 4),
		view.getUint32(chunkOffset + 8),
		view.getUint32(chunkOffset + 12),
		view.getUint32(chunkOffset + 16),
		view.getUint32(chunkOffset + 20),
		view.getUint32(chunkOffset + 24),
		view.getUint32(chunkOffset + 28),
		view.getUint32(chunkOffset + 32),
	];

	chunkOffset += 36;

	const width = view.getUint32(chunkOffset);
	chunkOffset += 4;

	const height = view.getUint32(chunkOffset);
	chunkOffset += 4;

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
