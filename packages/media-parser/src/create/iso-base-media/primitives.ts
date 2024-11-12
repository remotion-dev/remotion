import {combineUint8Arrays} from '../../boxes/webm/make-header';

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

export const setFixedPointSigned1616Number = (num: number) => {
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
