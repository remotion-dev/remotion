import type {BaseBox} from './base-type';
import {toUnixTimestamp} from './to-date';

export type ThreeDMatrix = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
	number,
];

export interface MvhdBox extends BaseBox {
	durationInUnits: number;
	durationInSeconds: number;
	creationTime: number | null;
	modificationTime: number | null;
	timeScale: number;
	rate: number;
	volume: number;
	matrix: ThreeDMatrix;
	nextTrackId: number;
	type: 'mvhd-box';
}

export const parseMvhd = (data: ArrayBuffer, offset: number): MvhdBox => {
	let chunkOffset = 0;

	const view = new DataView(data);
	const size = view.getUint32(chunkOffset);
	chunkOffset += 4;
	const atom = data.slice(chunkOffset, chunkOffset + 4);
	const atomString = new TextDecoder().decode(atom);
	if (atomString !== 'mvhd') {
		throw new Error(`Expected mvhd atom, got ${atomString}`);
	}

	chunkOffset += 4;
	const version = view.getUint8(chunkOffset);
	if (version !== 0) {
		throw new Error(`Unsupported MVHD version ${version}`);
	}

	chunkOffset += 1;

	if (size !== 108) {
		throw new Error(`Expected mvhd size of version 0 to be 108, got ${size}`);
	}

	// Flags, we discard them
	data.slice(chunkOffset, chunkOffset + 3);
	chunkOffset += 3;

	const creationTime = view.getUint32(chunkOffset);
	chunkOffset += 4;

	const modificationTime = view.getUint32(chunkOffset);
	chunkOffset += 4;

	const timeScale = view.getUint32(chunkOffset);
	chunkOffset += 4;

	const durationInUnits = view.getUint32(chunkOffset);
	const durationInSeconds = durationInUnits / timeScale;
	chunkOffset += 4;

	const rateArray = data.slice(chunkOffset, chunkOffset + 4);
	const rateView = new DataView(rateArray);
	const rate =
		rateView.getInt8(0) * 10 +
		rateView.getInt8(1) +
		rateView.getInt8(2) * 0.1 +
		rateView.getInt8(3) * 0.01;
	chunkOffset += 4;

	const volumeArray = data.slice(chunkOffset, chunkOffset + 2);
	const volumeView = new DataView(volumeArray);
	chunkOffset += 2;
	const volume = volumeView.getInt8(0) + volumeView.getInt8(1) * 0.1;

	// reserved 16bit
	chunkOffset += 2;

	// reserved 32bit x2
	chunkOffset += 4 * 2;

	// matrix
	const matrix: number[] = [];
	for (let i = 0; i < 9; i++) {
		matrix.push(view.getUint32(chunkOffset));
		chunkOffset += 4;
	}

	// pre-defined
	chunkOffset += 4 * 6;

	// next track id
	const nextTrackId = view.getUint32(chunkOffset);
	chunkOffset += 4;

	return {
		creationTime: toUnixTimestamp(creationTime),
		modificationTime: toUnixTimestamp(modificationTime),
		timeScale,
		durationInUnits,
		durationInSeconds,
		rate,
		volume,
		matrix: matrix as ThreeDMatrix,
		nextTrackId,
		type: 'mvhd-box',
		boxSize: data.byteLength,
		offset,
	};
};
