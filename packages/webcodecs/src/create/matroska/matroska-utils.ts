/* eslint-disable @typescript-eslint/no-use-before-define */
import type {
	Ebml,
	EbmlValue,
	FloatWithSize,
	PossibleEbml,
	Prettify,
	UintWithSize,
} from '@remotion/media-parser';
import {MediaParserInternals} from '@remotion/media-parser';

export const getIdForName = (name: string): EbmlMapKey => {
	const value = Object.entries(MediaParserInternals.matroskaElements).find(
		([key]) => key === name,
	)?.[1];
	if (!value) {
		throw new Error(`Could not find id for name ${name}`);
	}

	return value as EbmlMapKey;
};

function putUintDynamic(number: number, minimumLength: number | null) {
	if (number < 0) {
		throw new Error(
			'This function is designed for non-negative integers only.',
		);
	}

	// Calculate the minimum number of bytes needed to store the integer
	const length = Math.max(
		minimumLength ?? 0,
		Math.ceil(Math.log2(number + 1) / 8),
	);
	const bytes = new Uint8Array(length);

	for (let i = 0; i < length; i++) {
		// Extract each byte from the number
		bytes[length - 1 - i] = (number >> (8 * i)) & 0xff;
	}

	return bytes;
}

const makeFromStructure = (
	fields: PossibleEbmlOrUint8Array,
): BytesAndOffset => {
	if ('bytes' in fields) {
		return fields;
	}

	const arrays: Uint8Array[] = [];

	const struct = MediaParserInternals.ebmlMap[getIdForName(fields.type)];

	if (struct.type === 'uint8array') {
		return {
			bytes: fields.value as Uint8Array,
			offsets: {offset: 0, children: [], field: fields.type},
		};
	}

	if (struct.type === 'children') {
		const children: OffsetAndChildren[] = [];
		let bytesWritten = 0;
		for (const item of fields.value as PossibleEbml[]) {
			const {bytes, offsets} = makeMatroskaBytes(item);
			arrays.push(bytes);
			children.push(incrementOffsetAndChildren(offsets, bytesWritten));
			bytesWritten += bytes.byteLength;
		}

		return {
			bytes: combineUint8Arrays(arrays),
			offsets: {offset: 0, children, field: fields.type},
		};
	}

	if (struct.type === 'string') {
		return {
			bytes: new TextEncoder().encode(fields.value as string),
			offsets: {
				children: [],
				offset: 0,
				field: fields.type,
			},
		};
	}

	if (struct.type === 'uint') {
		return {
			bytes: putUintDynamic(
				(fields.value as UintWithSize).value,
				(fields.value as UintWithSize).byteLength,
			),
			offsets: {
				children: [],
				offset: 0,
				field: fields.type,
			},
		};
	}

	if (struct.type === 'hex-string') {
		const hex = (fields.value as string).substring(2);
		const arr = new Uint8Array(hex.length / 2);
		for (let i = 0; i < hex.length; i += 2) {
			const byte = parseInt(hex.substring(i, i + 2), 16);
			arr[i / 2] = byte;
		}

		return {
			bytes: arr,
			offsets: {
				children: [],
				offset: 0,
				field: fields.type,
			},
		};
	}

	if (struct.type === 'float') {
		const value = fields.value as FloatWithSize;
		if (value.size === '32') {
			const dataView = new DataView(new ArrayBuffer(4));
			dataView.setFloat32(0, value.value);
			return {
				bytes: new Uint8Array(dataView.buffer),
				offsets: {
					children: [],
					offset: 0,
					field: fields.type,
				},
			};
		}

		const dataView2 = new DataView(new ArrayBuffer(8));
		dataView2.setFloat64(0, value.value);
		return {
			bytes: new Uint8Array(dataView2.buffer),
			offsets: {
				children: [],
				offset: 0,
				field: fields.type,
			},
		};
	}

	throw new Error('Unexpected type');
};

export const combineUint8Arrays = (arrays: Uint8Array[]) => {
	if (arrays.length === 0) {
		return new Uint8Array([]);
	}

	if (arrays.length === 1) {
		return arrays[0];
	}

	let totalLength = 0;
	for (const array of arrays) {
		totalLength += array.length;
	}

	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const array of arrays) {
		result.set(array, offset);
		offset += array.length;
	}

	return result;
};

export type OffsetAndChildren = {
	offset: number;
	children: OffsetAndChildren[];
	field: keyof typeof MediaParserInternals.matroskaElements;
};

export const incrementOffsetAndChildren = (
	offset: OffsetAndChildren,
	increment: number,
): OffsetAndChildren => {
	return {
		offset: offset.offset + increment,
		children: offset.children.map((c) =>
			incrementOffsetAndChildren(c, increment),
		),
		field: offset.field,
	};
};

export const matroskaToHex = (
	matrId: (typeof MediaParserInternals.matroskaElements)[keyof typeof MediaParserInternals.matroskaElements],
) => {
	const numbers: Uint8Array = new Uint8Array((matrId.length - 2) / 2);

	for (let i = 2; i < matrId.length; i += 2) {
		const hex = matrId.substring(i, i + 2);
		numbers[(i - 2) / 2] = parseInt(hex, 16);
	}

	return numbers;
};

export type BytesAndOffset = {
	bytes: Uint8Array;
	offsets: OffsetAndChildren;
};

export type EbmlValueOrUint8Array<T extends Ebml> =
	| Uint8Array
	| EbmlValue<T, PossibleEbmlOrUint8Array>;

export type EbmlParsedOrUint8Array<T extends Ebml> = {
	type: T['name'];
	value: EbmlValueOrUint8Array<T>;
	minVintWidth: number | null;
};

// https://github.com/Vanilagy/webm-muxer/blob/main/src/ebml.ts#L101

export const measureEBMLVarInt = (value: number) => {
	if (value < (1 << 7) - 1) {
		/** Top bit is set, leaving 7 bits to hold the integer, but we can't store
		 * 127 because "all bits set to one" is a reserved value. Same thing for the
		 * other cases below:
		 */
		return 1;
	}

	if (value < (1 << 14) - 1) {
		return 2;
	}

	if (value < (1 << 21) - 1) {
		return 3;
	}

	if (value < (1 << 28) - 1) {
		return 4;
	}

	if (value < 2 ** 35 - 1) {
		return 5;
	}

	if (value < 2 ** 42 - 1) {
		return 6;
	}

	throw new Error('EBML VINT size not supported ' + value);
};

export const getVariableInt = (value: number, minWidth: number | null) => {
	const width = Math.max(measureEBMLVarInt(value), minWidth ?? 0);

	switch (width) {
		case 1:
			return new Uint8Array([(1 << 7) | value]);
		case 2:
			return new Uint8Array([(1 << 6) | (value >> 8), value]);
		case 3:
			return new Uint8Array([(1 << 5) | (value >> 16), value >> 8, value]);
		case 4:
			return new Uint8Array([
				(1 << 4) | (value >> 24),
				value >> 16,
				value >> 8,
				value,
			]);
		case 5:
			/**
			 * JavaScript converts its doubles to 32-bit integers for bitwise
			 * operations, so we need to do a division by 2^32 instead of a
			 * right-shift of 32 to retain those top 3 bits
			 */
			return new Uint8Array([
				(1 << 3) | ((value / 2 ** 32) & 0x7),
				value >> 24,
				value >> 16,
				value >> 8,
				value,
			]);
		case 6:
			return new Uint8Array([
				(1 << 2) | ((value / 2 ** 40) & 0x3),
				(value / 2 ** 32) | 0,
				value >> 24,
				value >> 16,
				value >> 8,
				value,
			]);
		case 7:
			return new Uint8Array([
				(1 << 1) | ((value / 2 ** 48) & 0x1),
				(value / 2 ** 40) | 0,
				(value / 2 ** 32) | 0,
				value >> 24,
				value >> 16,
				value >> 8,
				value,
			]);
		case 8:
			return new Uint8Array([
				(1 << 0) | ((value / 2 ** 56) & 0x1),
				(value / 2 ** 48) | 0,
				(value / 2 ** 40) | 0,
				(value / 2 ** 32) | 0,
				value >> 24,
				value >> 16,
				value >> 8,
				value,
			]);
		default:
			throw new Error('Bad EBML VINT size ' + width);
	}
};

export const makeMatroskaBytes = (
	fields: PossibleEbmlOrUint8Array,
): BytesAndOffset => {
	if ('bytes' in fields) {
		return fields;
	}

	const value = makeFromStructure(fields);
	const header = matroskaToHex(getIdForName(fields.type));
	const size = getVariableInt(value.bytes.length, fields.minVintWidth);

	const bytes = combineUint8Arrays([header, size, value.bytes]);

	return {
		bytes,
		offsets: {
			offset: value.offsets.offset,
			field: value.offsets.field,
			children: value.offsets.children.map((c) => {
				return incrementOffsetAndChildren(
					c,
					header.byteLength + size.byteLength,
				);
			}),
		},
	};
};

export type PossibleEbmlOrUint8Array =
	| Prettify<
			{
				[key in keyof typeof MediaParserInternals.ebmlMap]: EbmlParsedOrUint8Array<
					(typeof MediaParserInternals.ebmlMap)[key]
				>;
			}[keyof typeof MediaParserInternals.ebmlMap]
	  >
	| BytesAndOffset;

export type EbmlMapKey = keyof typeof MediaParserInternals.ebmlMap;

export const padMatroskaBytes = (
	fields: PossibleEbmlOrUint8Array,
	totalLength: number,
): BytesAndOffset[] => {
	const regular = makeMatroskaBytes(fields);
	const paddingLength =
		totalLength -
		regular.bytes.byteLength -
		matroskaToHex(MediaParserInternals.matroskaElements.Void).byteLength;

	if (paddingLength < 0) {
		throw new Error('ooops');
	}

	const padding = makeMatroskaBytes({
		type: 'Void',
		value: new Uint8Array(paddingLength).fill(0),
		minVintWidth: null,
	});

	return [
		regular,
		{
			bytes: padding.bytes,
			offsets: incrementOffsetAndChildren(
				padding.offsets,
				regular.bytes.length,
			),
		},
	];
};

export function serializeUint16(value: number): Uint8Array {
	const buffer = new ArrayBuffer(2);

	const view = new DataView(buffer);

	view.setUint16(0, value);

	return new Uint8Array(buffer);
}
