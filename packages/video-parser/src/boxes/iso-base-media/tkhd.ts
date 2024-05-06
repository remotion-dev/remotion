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

export const parseTkhd = (data: Buffer, fileOffset: number): TkhdBox => {
	let chunkOffset = 0;

	const size = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;
	const atom = data.subarray(chunkOffset, chunkOffset + 4);
	if (atom.toString() !== 'tkhd') {
		throw new Error(`Expected tkhd atom, got ${atom.toString('utf-8')}`);
	}

	chunkOffset += 4;
	const version = data.readUInt8(chunkOffset);
	if (version !== 0) {
		throw new Error(`Unsupported TKHD version ${version}`);
	}

	chunkOffset += 1;

	if (size !== 92) {
		throw new Error(`Expected tkhd size of version 0 to be 92, got ${size}`);
	}

	// Flags, we discard them
	data.subarray(chunkOffset, chunkOffset + 3);
	chunkOffset += 3;

	const creationTime = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	const modificationTime = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	const trackId = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	// reserved
	chunkOffset += 4;

	const duration = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	// reserved 2
	chunkOffset += 4;

	// reserved 3
	chunkOffset += 4;

	const layer = data.readUInt16BE(chunkOffset);
	chunkOffset += 2;

	const alternateGroup = data.readUInt16BE(chunkOffset);
	chunkOffset += 2;

	const volume = data.readUInt16BE(chunkOffset);
	chunkOffset += 2;

	// reserved 4
	chunkOffset += 2;

	const matrix = [
		data.readUInt32BE(chunkOffset),
		data.readUInt32BE(chunkOffset + 4),
		data.readUInt32BE(chunkOffset + 8),
		data.readUInt32BE(chunkOffset + 12),
		data.readUInt32BE(chunkOffset + 16),
		data.readUInt32BE(chunkOffset + 20),
		data.readUInt32BE(chunkOffset + 24),
		data.readUInt32BE(chunkOffset + 28),
		data.readUInt32BE(chunkOffset + 32),
	];

	chunkOffset += 36;

	const width = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	const height = data.readUInt32BE(chunkOffset);
	chunkOffset += 4;

	return {
		offset: fileOffset,
		boxSize: data.length,
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
