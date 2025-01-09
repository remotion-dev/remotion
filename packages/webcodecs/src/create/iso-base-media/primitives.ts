import {combineUint8Arrays} from '../matroska/matroska-utils';

export const stringsToUint8Array = (str: string) => {
	return new TextEncoder().encode(str);
};

export const numberTo32BitUIntOrInt = (num: number) => {
	return new Uint8Array([
		(num >> 24) & 0xff,
		(num >> 16) & 0xff,
		(num >> 8) & 0xff,
		num & 0xff,
	]);
};

export const numberTo32BitUIntOrIntLeading128 = (num: number) => {
	const arr = [
		(num >> 24) & 0xff,
		(num >> 16) & 0xff,
		(num >> 8) & 0xff,
		num & 0xff,
	];
	for (const i in arr) {
		if (arr[i] === 0) {
			arr[i] = 128;
		} else {
			break;
		}
	}

	return new Uint8Array(arr);
};

export const numberTo16BitUIntOrInt = (num: number) => {
	return new Uint8Array([(num >> 8) & 0xff, num & 0xff]);
};

export const setFixedPointSignedOrUnsigned1616Number = (num: number) => {
	const val = Math.round(num * 2 ** 16);
	return numberTo32BitUIntOrInt(val);
};

export const setFixedPointSigned230Number = (num: number) => {
	const val = Math.round(num * 2 ** 30);
	return numberTo32BitUIntOrInt(val);
};

export const addSize = (arr: Uint8Array) => {
	return combineUint8Arrays([numberTo32BitUIntOrInt(arr.length + 4), arr]);
};

export const addLeading128Size = (arr: Uint8Array) => {
	return combineUint8Arrays([
		numberTo32BitUIntOrIntLeading128(arr.length),
		arr,
	]);
};

export const floatTo16Point1632Bit = (number: number) => {
	// Ensure the number has exactly 2 decimal places
	const fixedNumber = Number(number.toFixed(2));

	// Create a new Uint8Array of 4 bytes
	const result = new Uint8Array(4);

	// Extract digits
	const tens = Math.floor(fixedNumber / 10);
	const ones = Math.floor(fixedNumber % 10);
	const tenths = Math.floor((fixedNumber * 10) % 10);
	const hundredths = Math.floor((fixedNumber * 100) % 10);

	// Assign to array
	result[0] = tens;
	result[1] = ones;
	result[2] = tenths;
	result[3] = hundredths;

	return result;
};

export const floatTo16Point16_16Bit = (number: number) => {
	// Ensure the number has exactly 2 decimal places
	const fixedNumber = Number(number.toFixed(2));

	// Create a new Uint8Array of 4 bytes
	const result = new Uint8Array(2);

	// Extract digits
	const ones = Math.floor(fixedNumber % 10);
	const tenths = Math.floor((fixedNumber * 10) % 10);

	// Assign to array
	result[0] = ones;
	result[1] = tenths;

	return result;
};

export const serializeMatrix = (matrix: number[]) => {
	return combineUint8Arrays([
		setFixedPointSignedOrUnsigned1616Number(matrix[0]),
		setFixedPointSignedOrUnsigned1616Number(matrix[1]),
		setFixedPointSigned230Number(matrix[2]),
		setFixedPointSignedOrUnsigned1616Number(matrix[3]),
		setFixedPointSignedOrUnsigned1616Number(matrix[4]),
		setFixedPointSigned230Number(matrix[5]),
		setFixedPointSignedOrUnsigned1616Number(matrix[6]),
		setFixedPointSignedOrUnsigned1616Number(matrix[7]),
		setFixedPointSigned230Number(matrix[8]),
	]);
};

export const stringToPascalString = (str: string) => {
	// Create a fixed 32-byte Uint8Array
	const buffer = new Uint8Array(32);

	// Convert the string characters to bytes
	for (let i = 0; i < Math.min(str.length, 32); i++) {
		buffer[i] = str.charCodeAt(i);
	}

	return buffer;
};

export const padIsoBaseMediaBytes = (data: Uint8Array, totalLength: number) => {
	if (data.length - 8 > totalLength) {
		throw new Error(
			`Data is longer than the total length: ${data.length - 8} > ${totalLength}`,
		);
	}

	if (data.length - 8 === totalLength) {
		return data;
	}

	return combineUint8Arrays([
		data,
		addSize(
			combineUint8Arrays([
				stringsToUint8Array('free'),
				new Uint8Array(totalLength - (data.length - 8)),
			]),
		),
	]);
};

type ThreeDMatrix = [
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

export const IDENTITY_MATRIX: ThreeDMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
