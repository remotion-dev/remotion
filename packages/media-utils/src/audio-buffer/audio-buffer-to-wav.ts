/**
 * Inlined from https://github.com/Jam3/audiobuffer-to-wav/commit/2272eb09bd46a05e50a6d684d908aa6f13c58f63#diff-e727e4bdf3657fd1d798edcd6b099d6e092f8573cba266154583a746bba0f346
 */

function interleave(inputL: Float32Array, inputR: Float32Array) {
	const length = inputL.length + inputR.length;
	const result = new Float32Array(length);

	let index = 0;
	let inputIndex = 0;

	while (index < length) {
		result[index++] = inputL[inputIndex];
		result[index++] = inputR[inputIndex];
		inputIndex++;
	}

	return result;
}

function writeFloat32(output: DataView, offset: number, input: Float32Array) {
	for (let i = 0; i < input.length; i++, offset += 4) {
		output.setFloat32(offset, input[i], true);
	}
}

function floatTo16BitPCM(
	output: DataView,
	offset: number,
	input: Float32Array,
) {
	for (let i = 0; i < input.length; i++, offset += 2) {
		const s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
}

function writeString(view: DataView, offset: number, string: string) {
	for (let i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

function encodeWAV({
	samples,
	format,
	sampleRate,
	numChannels,
	bitDepth,
}: {
	samples: Float32Array;
	format: 3 | 1;
	sampleRate: number;
	numChannels: number;
	bitDepth: 32 | 16;
}) {
	const bytesPerSample = bitDepth / 8;
	const blockAlign = numChannels * bytesPerSample;

	const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
	const view = new DataView(buffer);

	/* RIFF identifier */
	writeString(view, 0, 'RIFF');
	/* RIFF chunk length */
	view.setUint32(4, 36 + samples.length * bytesPerSample, true);
	/* RIFF type */
	writeString(view, 8, 'WAVE');
	/* format chunk identifier */
	writeString(view, 12, 'fmt ');
	/* format chunk length */
	view.setUint32(16, 16, true);
	/* sample format (raw) */
	view.setUint16(20, format, true);
	/* channel count */
	view.setUint16(22, numChannels, true);
	/* sample rate */
	view.setUint32(24, sampleRate, true);
	/* byte rate (sample rate * block align) */
	view.setUint32(28, sampleRate * blockAlign, true);
	/* block align (channel count * bytes per sample) */
	view.setUint16(32, blockAlign, true);
	/* bits per sample */
	view.setUint16(34, bitDepth, true);
	/* data chunk identifier */
	writeString(view, 36, 'data');
	/* data chunk length */
	view.setUint32(40, samples.length * bytesPerSample, true);
	if (format === 1) {
		// Raw PCM
		floatTo16BitPCM(view, 44, samples);
	} else {
		writeFloat32(view, 44, samples);
	}

	return buffer;
}

export function audioBufferToWav(
	buffer: AudioBuffer,
	opt: {
		float32: boolean;
	},
) {
	const numChannels = buffer.numberOfChannels;
	const {sampleRate} = buffer;
	const format = opt.float32 ? 3 : 1;
	const bitDepth = format === 3 ? 32 : 16;

	let result;
	if (numChannels === 2) {
		result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
	} else {
		result = buffer.getChannelData(0);
	}

	return encodeWAV({
		samples: result,
		format,
		sampleRate,
		numChannels,
		bitDepth,
	});
}
