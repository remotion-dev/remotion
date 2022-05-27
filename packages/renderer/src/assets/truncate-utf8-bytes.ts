function isHighSurrogate(codePoint: number) {
	return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint: number) {
	return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

const getLength = Buffer.byteLength.bind(Buffer);

export function truncateUtf8Bytes(string: string, byteLength: number) {
	if (typeof string !== 'string') {
		throw new Error('Input must be string');
	}

	const charLength = string.length;
	let curByteLength = 0;
	let codePoint;
	let segment;

	for (let i = 0; i < charLength; i += 1) {
		codePoint = string.charCodeAt(i);
		segment = string[i];

		if (
			isHighSurrogate(codePoint) &&
			isLowSurrogate(string.charCodeAt(i + 1))
		) {
			i += 1;
			segment += string[i];
		}

		curByteLength += getLength(segment);

		if (curByteLength === byteLength) {
			return string.slice(0, i + 1);
		}

		if (curByteLength > byteLength) {
			return string.slice(0, i - segment.length + 1);
		}
	}

	return string;
}
