import {expect, test} from 'vitest';
import {StreamingPitchShifter} from '../audio/pitch-shift';

const makeSine = ({
	frequency,
	sampleRate,
	durationInSeconds,
}: {
	frequency: number;
	sampleRate: number;
	durationInSeconds: number;
}) => {
	const audio = new Float32Array(sampleRate * durationInSeconds);
	for (let frame = 0; frame < audio.length; frame++) {
		audio[frame] = Math.sin((frame / sampleRate) * frequency * Math.PI * 2);
	}

	return audio;
};

const concatenate = (chunks: Float32Array[]) => {
	const result = new Float32Array(
		chunks.reduce((sum, chunk) => sum + chunk.length, 0),
	);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}

	return result;
};

const estimateFrequency = ({
	audio,
	sampleRate,
}: {
	audio: Float32Array;
	sampleRate: number;
}) => {
	const start = Math.floor(sampleRate * 0.2);
	const end = Math.floor(sampleRate * 0.8);
	let positiveCrossings = 0;
	for (let frame = start + 1; frame < end; frame++) {
		if (audio[frame - 1] <= 0 && audio[frame] > 0) {
			positiveCrossings++;
		}
	}

	return positiveCrossings / ((end - start) / sampleRate);
};

test('changes pitch while preserving the sample count', () => {
	const sampleRate = 48_000;
	const source = makeSine({
		frequency: 440,
		sampleRate,
		durationInSeconds: 1,
	});

	for (const toneFrequency of [0.75, 1.5]) {
		const shifter = new StreamingPitchShifter({
			numberOfChannels: 1,
			sampleRate,
			toneFrequency,
		});
		const chunks: Float32Array[] = [];
		for (let frame = 0; frame < source.length; frame += 128) {
			const output = shifter.append([source.slice(frame, frame + 128)])[0];
			if (output.length > 0) {
				chunks.push(output);
			}
		}

		chunks.push(shifter.finalize()[0]);
		const shifted = concatenate(chunks);
		expect(shifted.length).toBe(source.length);
		expect(estimateFrequency({audio: shifted, sampleRate})).toBeCloseTo(
			440 * toneFrequency,
			-1,
		);
	}
});
