import {fetchWithCorsCatch} from './fetch-with-cors-catch';

const getUint32 = (bytes: Uint8Array, offset: number) => {
	const val1 = bytes[offset + 3];
	const val2 = bytes[offset + 2];
	const val3 = bytes[offset + 1];
	const val4 = bytes[offset];
	return (val1 << 24) | (val2 << 16) | (val3 << 8) | val4;
};

const getUint16 = (bytes: Uint8Array, offset: number) => {
	const val1 = bytes[offset + 1];
	const val2 = bytes[offset];
	return (val1 << 8) | val2;
};

export const getInt16AsFloat = (bytes: Uint8Array, offset: number) => {
	if (offset >= bytes.length) {
		throw new Error(
			`Tried to read a 16-bit integer from offset ${offset} but the array length is ${bytes.length}`,
		);
	}

	const val1 = bytes[offset + 1];
	const val2 = bytes[offset];
	const int16 = (val1 << 8) | val2;
	return ((int16 << 16) >> 16) / 32768;
};

export const getInt8AsFloat = (bytes: Uint8Array, offset: number) => {
	if (offset >= bytes.length) {
		throw new Error(
			`Tried to read an 8-bit integer from offset ${offset} but the array length is ${bytes.length}`,
		);
	}

	return bytes[offset] / 128;
};

export type WaveProbe = {
	dataOffset: number;
	bitsPerSample: number;
	numberOfChannels: number;
	sampleRate: number;
	blockAlign: number;
	fileSize: number;
	durationInSeconds: number;
};

export const probeWaveFile = async (src: string): Promise<WaveProbe> => {
	const response = await fetchWithCorsCatch(src, {
		headers: {
			range: 'bytes=0-256',
		},
	});
	if (response.status !== 206) {
		throw new Error(
			`Tried to read bytes 0-256 from ${src}, but the response status code was not 206. This means the server might not support returning a partial response.`,
		);
	}

	const buffer = await response.arrayBuffer();
	const uintArray = new Uint8Array(buffer);

	const shouldBeRiff = new TextDecoder().decode(uintArray.slice(0, 4));
	if (shouldBeRiff !== 'RIFF') {
		throw new Error(
			'getPartialAudioData() requires a WAVE file, but the first bytes are not RIFF. ',
		);
	}

	const size = getUint32(uintArray, 4);
	const shouldBeWAVE = new TextDecoder().decode(uintArray.slice(8, 12));
	if (shouldBeWAVE !== 'WAVE') {
		throw new Error(
			'getPartialAudioData() requires a WAVE file, but the bytes 8-11 are not "WAVE". ',
		);
	}

	const shouldBeFmt = new TextDecoder().decode(uintArray.slice(12, 16));
	if (shouldBeFmt !== 'fmt ') {
		throw new Error(
			'getPartialAudioData() requires a WAVE file, but the bytes 12-15 are not "fmt ". ',
		);
	}

	// const chunkSize = toUint32(uintArray.slice(16, 20));
	const audioFormat = getUint16(uintArray, 20);
	if (audioFormat !== 1) {
		throw new Error(
			'getPartialAudioData() supports only a WAVE file with PCM audio format, but the audio format is not PCM. ',
		);
	}

	const numberOfChannels = getUint16(uintArray, 22);
	const sampleRate = getUint32(uintArray, 24);
	// const byteRate = toUint32(uintArray.slice(28, 32));
	const blockAlign = getUint16(uintArray, 32);
	const bitsPerSample = getUint16(uintArray, 34);
	let offset = 36;
	const shouldBeDataOrList = new TextDecoder().decode(
		uintArray.slice(offset, offset + 4),
	);

	if (shouldBeDataOrList === 'LIST') {
		const listSize = getUint32(uintArray, 40);
		offset += listSize;
		offset += 8;
	}

	const shouldBeData = new TextDecoder().decode(
		uintArray.slice(offset, offset + 4),
	);

	if (shouldBeData !== 'data') {
		throw new Error(
			'getPartialAudioData() requires a WAVE file, but the bytes 36-39 are not "data". ',
		);
	}

	const dataSize = getUint32(uintArray, offset + 4);

	if (dataSize + offset !== size) {
		throw new Error(
			`getPartialAudioData() requires a WAVE file, but: Expected ${
				dataSize + offset
			}, got ${size}. `,
		);
	}

	return {
		dataOffset: offset + 8,
		bitsPerSample,
		numberOfChannels,
		sampleRate,
		blockAlign,
		fileSize: size,
		durationInSeconds: dataSize / (sampleRate * blockAlign),
	};
};
