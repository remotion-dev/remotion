import type {BufferIterator} from '../../buffer-iterator';
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
	unrotatedWidth: number;
	unrotatedHeight: number;
	rotation: number;
}

type Matrix2x2 = readonly [number, number, number, number];

function getRotationAngleFromMatrix(matrix: Matrix2x2): number {
	// Extract elements from the matrix
	const [a, b, c, d] = matrix;
	if (a === 0 && b === 0 && c === 0 && d === 0) {
		return 0;
	}

	// Check if the matrix is a valid rotation matrix
	if (Math.round(a * a + b * b) !== 1 || Math.round(c * c + d * d) !== 1) {
		throw new Error('The provided matrix is not a valid rotation matrix.');
	}

	// Calculate the angle using the atan2 function
	const angleRadians = Math.atan2(c, a); // atan2(sin(θ), cos(θ))
	const angleDegrees = angleRadians * (180 / Math.PI); // Convert radians to degrees

	return angleDegrees;
}

const applyRotation = ({
	matrix,
	width,
	height,
}: {
	matrix: Matrix2x2;
	width: number;
	height: number;
}) => {
	const newWidth = matrix[0] * width + matrix[1] * height; // 0*3840 + 1*2160
	const newHeight = matrix[2] * width + matrix[3] * height; // -1*3840 + 0*2160

	return {
		width: Math.abs(newWidth),
		height: Math.abs(newHeight),
	};
};

export const parseTkhd = ({
	iterator,
	offset,
	size,
}: {
	iterator: BufferIterator;
	offset: number;
	size: number;
}): TkhdBox => {
	const version = iterator.getUint8();

	// Flags, we discard them
	iterator.discard(3);

	const creationTime =
		version === 1 ? iterator.getUint64() : iterator.getUint32();

	const modificationTime =
		version === 1 ? iterator.getUint64() : iterator.getUint32();

	const trackId = iterator.getUint32();

	// reserved
	iterator.discard(4);

	const duration = version === 1 ? iterator.getUint64() : iterator.getUint32();

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

	const rotationMatrix = [matrix[0], matrix[1], matrix[3], matrix[4]] as const;

	const widthWithoutRotationApplied =
		iterator.getFixedPointUnsigned1616Number();
	const heightWithoutRotationApplied = iterator.getFixedPointSigned1616Number();

	const {width, height} = applyRotation({
		matrix: rotationMatrix,
		width: widthWithoutRotationApplied,
		height: heightWithoutRotationApplied,
	});

	const rotation = getRotationAngleFromMatrix(rotationMatrix);

	return {
		offset,
		boxSize: size,
		type: 'tkhd-box',
		creationTime: toUnixTimestamp(Number(creationTime)),
		modificationTime: toUnixTimestamp(Number(modificationTime)),
		trackId,
		duration: Number(duration),
		layer,
		alternateGroup,
		volume,
		matrix: matrix as ThreeDMatrix,
		width,
		height,
		version,
		rotation,
		unrotatedWidth: widthWithoutRotationApplied,
		unrotatedHeight: heightWithoutRotationApplied,
	};
};
