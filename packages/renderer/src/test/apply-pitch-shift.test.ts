import {expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {applyPitchShiftToWav} from '../assets/apply-pitch-shift';

const writeWavHeader = (view: DataView, dataBytes: number) => {
	for (const [offset, value] of [
		[0, 'RIFF'],
		[8, 'WAVE'],
		[12, 'fmt '],
		[36, 'data'],
	] as const) {
		for (let i = 0; i < value.length; i++) {
			view.setUint8(offset + i, value.charCodeAt(i));
		}
	}

	view.setUint32(4, 36 + dataBytes, true);
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 2, true);
	view.setUint32(24, 48000, true);
	view.setUint32(28, 48000 * 2 * 2, true);
	view.setUint16(32, 4, true);
	view.setUint16(34, 16, true);
	view.setUint32(40, dataBytes, true);
};

test('preserves the declared WAV data size when trailing samples are sparse', () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-wsola-'));
	const input = path.join(directory, 'input.wav');
	const output = path.join(directory, 'output.wav');

	try {
		const declaredDataBytes = 16;
		const physicallyWrittenDataBytes = 8;
		const inputBuffer = new Uint8Array(44 + physicallyWrittenDataBytes);
		writeWavHeader(
			new DataView(inputBuffer.buffer, inputBuffer.byteOffset),
			declaredDataBytes,
		);
		inputBuffer.fill(1, 44);
		fs.writeFileSync(input, inputBuffer);

		applyPitchShiftToWav({
			input,
			output,
			pitchRatio: 1,
			indent: false,
			logLevel: 'error',
		});

		const result = fs.readFileSync(output);
		expect(result.byteLength).toBe(44 + declaredDataBytes);
		expect(result.readUInt32LE(40)).toBe(declaredDataBytes);
		expect(result.subarray(44 + physicallyWrittenDataBytes)).toEqual(
			Buffer.alloc(declaredDataBytes - physicallyWrittenDataBytes),
		);
	} finally {
		fs.rmSync(directory, {recursive: true, force: true});
	}
});
