import type {BufferIterator} from '../../buffer-iterator';
import {getArrayBufferIterator} from '../../buffer-iterator';
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

export const parseMvhd = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): MvhdBox => {
	const version = iterator.getUint8();

	// Flags, we discard them
	iterator.discard(3);

	const creationTime =
		version === 1 ? iterator.getUint64() : iterator.getUint32();

	const modificationTime =
		version === 1 ? iterator.getUint64() : iterator.getUint32();

	const timeScale = iterator.getUint32();

	const durationInUnits =
		version === 1 ? iterator.getUint64() : iterator.getUint32();
	const durationInSeconds = Number(durationInUnits) / timeScale;

	const rateArray = iterator.getSlice(4);
	const rateView = getArrayBufferIterator(rateArray, rateArray.length);
	const rate =
		rateView.getInt8() * 10 +
		rateView.getInt8() +
		rateView.getInt8() * 0.1 +
		rateView.getInt8() * 0.01;

	const volumeArray = iterator.getSlice(2);
	const volumeView = getArrayBufferIterator(volumeArray, volumeArray.length);

	const volume = volumeView.getInt8() + volumeView.getInt8() * 0.1;

	// reserved 16bit
	iterator.discard(2);

	// reserved 32bit x2
	iterator.discard(4);
	iterator.discard(4);

	// matrix
	const matrix = [
		iterator.getFixedPointSigned1616Number(),
		iterator.getFixedPointSigned1616Number(),
		iterator.getFixedPointSigned230Number(),
		iterator.getFixedPointSigned1616Number(),
		iterator.getFixedPointSigned1616Number(),
		iterator.getFixedPointSigned230Number(),
		iterator.getFixedPointSigned1616Number(),
		iterator.getFixedPointSigned1616Number(),
		iterator.getFixedPointSigned230Number(),
	];

	// pre-defined
	iterator.discard(4 * 6);

	// next track id
	const nextTrackId = iterator.getUint32();

	volumeView.destroy();

	const bytesRemaining = size - (iterator.counter.getOffset() - offset);
	if (bytesRemaining !== 0) {
		throw new Error('expected 0 bytes ' + bytesRemaining);
	}

	return {
		creationTime: toUnixTimestamp(Number(creationTime)),
		modificationTime: toUnixTimestamp(Number(modificationTime)),
		timeScale,
		durationInUnits: Number(durationInUnits),
		durationInSeconds,
		rate,
		volume,
		matrix: matrix as ThreeDMatrix,
		nextTrackId,
		type: 'mvhd-box',
		boxSize: size,
		offset,
	};
};
