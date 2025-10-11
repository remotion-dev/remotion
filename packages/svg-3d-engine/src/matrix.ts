/* eslint-disable @typescript-eslint/no-use-before-define */
import type {ThreeDReducedInstruction} from './3d-svg';
import {truthy} from './truthy';

export const stride = function ({
	v,
	m,
	width,
	offset,
	colStride,
}: {
	v: Vector;
	m: MatrixTransform4D;
	width: number;
	offset: number;
	colStride: number;
}) {
	for (let i = 0; i < v.length; i++) {
		m[
			i * width + // Column
				((i * colStride + offset + width) % width) // Row
		] = v[i];
	}

	return m;
};

export const identity4 = function (): MatrixTransform4D {
	const n = 4;
	let size = n * n;
	const m = new Array(size) as MatrixTransform4D;
	while (size--) {
		m[size] = size % (n + 1) === 0 ? 1.0 : 0.0;
	}

	return m;
};

export const m44multiply = (
	...matrices: MatrixTransform4D[]
): MatrixTransform4D => {
	return multiplyMany(4, matrices);
};

// Accept an integer indicating the size of the matrices being multiplied (3 for 3x3), and any
// number of matrices following it.
function multiplyMany(
	size: number,
	listOfMatrices: MatrixTransform4D[],
): MatrixTransform4D {
	if (listOfMatrices.length < 2) {
		throw new Error('multiplication expected two or more matrices');
	}

	let result = mul(listOfMatrices[0], listOfMatrices[1], size);
	let next = 2;
	while (next < listOfMatrices.length) {
		result = mul(result, listOfMatrices[next], size);
		next++;
	}

	return result as MatrixTransform4D;
}

function mul(m1: number[], m2: number[], size: number): number[] {
	if (m1.length !== m2.length) {
		throw new Error(
			`Undefined for matrices of different sizes. m1.length=${m1.length}, m2.length=${m2.length}`,
		);
	}

	if (size * size !== m1.length) {
		throw new Error(
			`Undefined for non-square matrices. array size was ${size}`,
		);
	}

	const result = Array(m1.length);
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			// Accumulate a sum of m1[r,k]*m2[k, c]
			let acc = 0;
			for (let k = 0; k < size; k++) {
				acc += m1[size * r + k] * m2[size * k + c];
			}

			result[r * size + c] = acc;
		}
	}

	return result;
}

export type Vector2D = [number, number];
export type Vector = [number, number, number];
export type Vector4D = [number, number, number, number];

const rotated = function (axisVec: Vector, radians: number): MatrixTransform4D {
	return rotatedUnitSinCos(
		normalize(axisVec),
		Math.sin(radians),
		Math.cos(radians),
	);
};

export const rotateX = (radians: number) => {
	return rotated([1, 0, 0], radians);
};

export const rotateY = (radians: number) => {
	return rotated([0, 1, 0], radians);
};

export const translated4d = function (vec: Vector) {
	return stride({v: vec, m: identity4(), width: 4, offset: 3, colStride: 0});
};

export const rotateZ = (radians: number) => {
	return rotated([0, 0, 1], radians);
};

export type MatrixTransform4D = [
	number,
	number,
	number,
	number,
	number,
	number,
	number,
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

export const multiplyMatrices = (
	matrix1: MatrixTransform4D,
	matrix2: MatrixTransform4D,
): MatrixTransform4D => {
	const result: MatrixTransform4D = new Array(16).fill(0) as MatrixTransform4D;

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			for (let k = 0; k < 4; k++) {
				result[i * 4 + j] += matrix1[i * 4 + k] * matrix2[k * 4 + j];
			}
		}
	}

	return result;
};

export const reduceMatrices = (
	matrices: (MatrixTransform4D | null)[],
): MatrixTransform4D => {
	return matrices
		.filter(truthy)
		.slice()
		.reverse()
		.reduce((acc, cur) => {
			return multiplyMatrices(acc, cur);
		}, identity4());
};

export const aroundCenterPoint = ({
	matrix,
	x,
	y,
	z,
}: {
	matrix: MatrixTransform4D;
	x: number;
	y: number;
	z: number;
}) => {
	return reduceMatrices([
		translateX(-x),
		translateY(-y),
		translateZ(-z),
		matrix,
		translateX(x),
		translateY(y),
		translateZ(z),
	]);
};

export const makeMatrix3dTransform = function (
	matrix: MatrixTransform4D,
): string {
	return `matrix3d(${[
		matrix[0],
		matrix[4],
		matrix[8],
		matrix[12], // First column
		matrix[1],
		matrix[5],
		matrix[9],
		matrix[13], // Second column
		matrix[2],
		matrix[6],
		matrix[10],
		matrix[14], // Third column
		matrix[3],
		matrix[7],
		matrix[11],
		matrix[15], // Fourth column
	].join(', ')}`;
};

const interpolate = (a: number, b: number, t: number) => {
	return a + (b - a) * t;
};

export const interpolateMatrix4d = (
	input: number,
	matrix1: MatrixTransform4D,
	matrix2: MatrixTransform4D,
): MatrixTransform4D => {
	return [
		interpolate(matrix1[0], matrix2[0], input),
		interpolate(matrix1[1], matrix2[1], input),
		interpolate(matrix1[2], matrix2[2], input),
		interpolate(matrix1[3], matrix2[3], input),
		interpolate(matrix1[4], matrix2[4], input),
		interpolate(matrix1[5], matrix2[5], input),
		interpolate(matrix1[6], matrix2[6], input),
		interpolate(matrix1[7], matrix2[7], input),
		interpolate(matrix1[8], matrix2[8], input),
		interpolate(matrix1[9], matrix2[9], input),
		interpolate(matrix1[10], matrix2[10], input),
		interpolate(matrix1[11], matrix2[11], input),
		interpolate(matrix1[12], matrix2[12], input),
		interpolate(matrix1[13], matrix2[13], input),
		interpolate(matrix1[14], matrix2[14], input),
		interpolate(matrix1[15], matrix2[15], input),
	] as const;
};

export const scaled = function (value: number | Vector) {
	const vec: Vector = typeof value === 'number' ? [value, value, value] : value;
	return stride({v: vec, m: identity4(), width: 4, offset: 0, colStride: 1});
};

export const scaleX = (x: number) => {
	return scaled([x, 1, 1]);
};

export const scaleY = (y: number) => {
	return scaled([1, y, 1]);
};

const rotatedUnitSinCos = function (
	axisVec: Vector,
	sinAngle: number,
	cosAngle: number,
): MatrixTransform4D {
	const x = axisVec[0];
	const y = axisVec[1];
	const z = axisVec[2];
	const c = cosAngle;
	const s = sinAngle;
	const t = 1 - c;
	return [
		t * x * x + c,
		t * x * y - s * z,
		t * x * z + s * y,
		0,
		t * x * y + s * z,
		t * y * y + c,
		t * y * z - s * x,
		0,
		t * x * z - s * y,
		t * y * z + s * x,
		t * z * z + c,
		0,
		0,
		0,
		0,
		1,
	];
};

export const normalize = function (v: Vector): Vector {
	return mulScalar(v, 1 / vectorLength(v));
};

export const normalize4d = function (v: Vector4D): Vector4D {
	return mulScalar(v, 1 / vectorLength(v));
};

const vectorLength = function (v: number[]) {
	return Math.sqrt(lengthSquared(v));
};

const lengthSquared = function (v: number[]) {
	return dot(v, v);
};

export const dot = function (a: number[], b: number[]) {
	if (a.length !== b.length) {
		throw new Error(
			`Cannot perform dot product on arrays of different length (${a.length} vs ${b.length})`,
		);
	}

	return a
		.map((v, i) => {
			return v * b[i];
		})
		.reduce((acc, cur) => {
			return acc + cur;
		});
};

const translated = function (vec: Vector) {
	return stride({
		v: vec,
		m: identity4(),
		width: 4,
		offset: 3,
		colStride: 0,
	});
};

export const translateX = (x: number) => {
	return translated([x, 0, 0]);
};

export const translateY = (y: number) => {
	return translated([0, y, 0]);
};

export const translateZ = (z: number) => {
	return translated([0, 0, z]);
};

export type Camera = {
	near: number;
	far: number;
	angle: number;
	eye: Vector;
	coa: Vector;
	up: Vector;
};

export const mulScalar = function <T extends number[]>(v: T, s: number): T {
	return v.map((i) => {
		return i * s;
	}) as T;
};

export function multiplyMatrixAndSvgInstruction(
	matrix: MatrixTransform4D,
	point: ThreeDReducedInstruction,
): ThreeDReducedInstruction {
	if (point.type === 'C') {
		return {
			type: 'C',
			cp1: multiplyMatrix(matrix, point.cp1),
			cp2: multiplyMatrix(matrix, point.cp2),
			point: multiplyMatrix(matrix, point.point),
		};
	}

	if (point.type === 'Q') {
		return {
			type: 'Q',
			cp: multiplyMatrix(matrix, point.cp),
			point: multiplyMatrix(matrix, point.point),
		};
	}

	if (point.type === 'M') {
		return {
			type: 'M',
			point: multiplyMatrix(matrix, point.point),
		};
	}

	if (point.type === 'L') {
		return {
			type: 'L',
			point: multiplyMatrix(matrix, point.point),
		};
	}

	if (point.type === 'Z') {
		return {
			type: 'Z',
			point: multiplyMatrix(matrix, point.point),
		};
	}

	throw new Error('Unknown instruction type: ' + JSON.stringify(point));
}

export const multiplyMatrix = (
	matrix: MatrixTransform4D,
	point: Vector4D,
): Vector4D => {
	if (matrix.length !== 16 || point.length !== 4) {
		throw new Error('Invalid matrix or vector dimension');
	}

	const result: Vector4D = [0, 0, 0, 0];

	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			result[i] += matrix[i * 4 + j] * point[j];
		}
	}

	return result;
};

export const sub4d = function (a: Vector4D, b: Vector4D): Vector4D {
	return a.map((v, i) => {
		return v - b[i];
	}) as Vector4D;
};
