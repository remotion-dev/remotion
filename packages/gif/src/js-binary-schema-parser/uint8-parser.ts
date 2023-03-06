// Default stream and parsers for Uint8TypedArray data type
export const buildStream = (uint8Data: Uint8Array) => {
	return {
		data: uint8Data,
		pos: 0,
	};
};

export const readByte = () => {
	return function (stream) {
		return stream.data[stream.pos++];
	};
};

export const peekByte = (...arguments) => {
	const offset =
		arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	return function (stream) {
		return stream.data[stream.pos + offset];
	};
};

export const readBytes = (length) => {
	return function (stream) {
		return stream.data.subarray(stream.pos, (stream.pos += length));
	};
};

export const peekBytes = (length) => {
	return function (stream) {
		return stream.data.subarray(stream.pos, stream.pos + length);
	};
};

export const readString = (length) => {
	return function (stream) {
		return Array.from(readBytes(length)(stream))
			.map((value) => {
				return String.fromCharCode(value);
			})
			.join('');
	};
};

export const readUnsigned = (littleEndian) => {
	return function (stream) {
		const bytes = readBytes(2)(stream);
		return littleEndian
			? (bytes[1] << 8) + bytes[0]
			: (bytes[0] << 8) + bytes[1];
	};
};

export const readArray = (byteSize, totalOrFunc) => {
	return function (stream, result, parent) {
		const total =
			typeof totalOrFunc === 'function'
				? totalOrFunc(stream, result, parent)
				: totalOrFunc;
		const parser = readBytes(byteSize);
		const arr = new Array(total);

		for (let i = 0; i < total; i++) {
			arr[i] = parser(stream);
		}

		return arr;
	};
};

const subBitsTotal = function subBitsTotal(bits, startIndex, length) {
	let result = 0;

	for (let i = 0; i < length; i++) {
		result += bits[startIndex + i] && 2 ** (length - i - 1);
	}

	return result;
};

export const readBits = (schema) => {
	return function (stream) {
		const _byte = readByte()(stream); // convert the byte to bit array

		const bits = new Array(8);

		for (let i = 0; i < 8; i++) {
			bits[7 - i] = Boolean(_byte & (1 << i));
		} // convert the bit array to values based on the schema

		return Object.keys(schema).reduce((res, key) => {
			const def = schema[key];

			if (def.length) {
				res[key] = subBitsTotal(bits, def.index, def.length);
			} else {
				res[key] = bits[def.index];
			}

			return res;
		}, {});
	};
};
