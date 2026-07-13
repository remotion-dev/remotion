import fs from 'node:fs';
import {NoReactInternals} from 'remotion/no-react';
import type {LogLevel} from '../log-level';
import {Log} from '../logger';

const writeUint32LE = (view: DataView, offset: number, value: number) => {
	view.setUint32(offset, value, true);
};

const writeUint16LE = (view: DataView, offset: number, value: number) => {
	view.setUint16(offset, value, true);
};

const writeAscii = (view: DataView, offset: number, str: string) => {
	for (let i = 0; i < str.length; i++) {
		view.setUint8(offset + i, str.charCodeAt(i));
	}
};

// Apply a pure, duration-preserving pitch shift by ratio `pitchRatio` to a
// 16-bit PCM WAV file, in place. Mirrors the WSOLA shift that the preview
// applies via the AudioWorklet, so preview and render sound identical.
type ApplyPitchShiftToWavOptions = {
	input: string;
	output: string;
	pitchRatio: number;
	indent: boolean;
	logLevel: LogLevel;
};

export const applyPitchShiftToWav = ({
	input,
	output,
	pitchRatio,
	indent,
	logLevel,
}: ApplyPitchShiftToWavOptions) => {
	const startTimestamp = Date.now();

	const fileBuffer = fs.readFileSync(input);
	const view = new DataView(
		fileBuffer.buffer,
		fileBuffer.byteOffset,
		fileBuffer.byteLength,
	);

	const numberOfChannels = view.getUint16(22, true);
	const sampleRate = view.getUint32(24, true);
	const bitsPerSample = view.getUint16(34, true);

	if (bitsPerSample !== 16) {
		throw new Error(
			`Expected a 16-bit PCM WAV for the pitch shift, got ${bitsPerSample}-bit`,
		);
	}

	const bytesPerSample = 2;
	const dataOffset = 44;
	const dataBytes = view.getUint32(40, true);
	const availableDataBytes = Math.min(
		dataBytes,
		Math.max(0, fileBuffer.byteLength - dataOffset),
	);
	const totalSamples = Math.floor(
		dataBytes / (bytesPerSample * numberOfChannels),
	);
	const availableSamples = Math.floor(
		availableDataBytes / (bytesPerSample * numberOfChannels),
	);

	// Deinterleave Int16 PCM into per-channel Float32 [-1, 1].
	const inputChannels: Float32Array[] = [];
	for (let c = 0; c < numberOfChannels; c++) {
		inputChannels.push(new Float32Array(totalSamples));
	}

	for (let i = 0; i < availableSamples; i++) {
		for (let c = 0; c < numberOfChannels; c++) {
			const byteIndex =
				dataOffset + (i * numberOfChannels + c) * bytesPerSample;
			inputChannels[c][i] = view.getInt16(byteIndex, true) / 32768;
		}
	}

	const shifter = new NoReactInternals.WsolaPitchShifter({
		sampleRate,
		channels: numberOfChannels,
	});
	shifter.setPitchRatio(pitchRatio);

	const processed = shifter.process(inputChannels);
	const flushed = shifter.flush();

	// Concatenate the streamed output with the flushed tail, then force the
	// length back to exactly `totalSamples` (the shift preserves duration up to
	// rounding). This keeps the WAV data size stable.
	const outputChannels: Float32Array[] = [];
	for (let c = 0; c < numberOfChannels; c++) {
		const out = new Float32Array(totalSamples);
		let written = 0;
		for (const part of [processed[c], flushed[c]]) {
			if (!part) {
				continue;
			}

			const take = Math.min(part.length, totalSamples - written);
			out.set(part.subarray(0, take), written);
			written += take;
			if (written >= totalSamples) {
				break;
			}
		}

		outputChannels.push(out);
	}

	// Reinterleave to Int16 PCM.
	const outBuffer = new Uint8Array(dataOffset + dataBytes);
	const outView = new DataView(
		outBuffer.buffer,
		outBuffer.byteOffset,
		outBuffer.byteLength,
	);

	writeAscii(outView, 0, 'RIFF');
	writeUint32LE(outView, 4, 36 + dataBytes);
	writeAscii(outView, 8, 'WAVE');
	writeAscii(outView, 12, 'fmt ');
	writeUint32LE(outView, 16, 16);
	writeUint16LE(outView, 20, 1); // PCM
	writeUint16LE(outView, 22, numberOfChannels);
	writeUint32LE(outView, 24, sampleRate);
	writeUint32LE(outView, 28, sampleRate * numberOfChannels * bytesPerSample);
	writeUint16LE(outView, 32, numberOfChannels * bytesPerSample);
	writeUint16LE(outView, 34, 16);
	writeAscii(outView, 36, 'data');
	writeUint32LE(outView, 40, dataBytes);

	for (let i = 0; i < totalSamples; i++) {
		for (let c = 0; c < numberOfChannels; c++) {
			const clamped = Math.max(-1, Math.min(1, outputChannels[c][i]));
			const int16 = Math.round(clamped * 32767);
			const byteIndex =
				dataOffset + (i * numberOfChannels + c) * bytesPerSample;
			outView.setInt16(byteIndex, int16, true);
		}
	}

	fs.writeFileSync(output, outBuffer);

	Log.verbose(
		{indent, logLevel},
		'Applied pitch shift',
		`(ratio ${pitchRatio.toFixed(5)})`,
		`${Date.now() - startTimestamp}ms`,
	);
};
