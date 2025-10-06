function clamp16(x: number): number {
	const y = Math.round(x);
	return y < -32768 ? -32768 : y > 32767 ? 32767 : y;
}

/**
 * WSOLA time-scale modification for interleaved Int16 PCM (multi-channel).
 * - Preserves pitch approximately while changing tempo by factor f.
 * - Works for N interleaved channels.
 * - Mitigates head/tail fade-out via overlap-weight normalization and boundary reinforcement.
 *
 * @param input Interleaved Int16 PCM (e.g., LRLRLR... for stereo)
 * @param channels Number of channels (>=1)
 * @param f Tempo factor: >1 = faster/shorter, <1 = slower/longer
 * @param opts Optional tuning parameters
 * @returns Interleaved Int16Array with length ≈ round(input.length * f)
 */
export function wsolaInt16Interleaved(
	input: Int16Array,
	channels: number,
	f: number,
): Int16Array {
	if (!Number.isFinite(f) || f <= 0)
		throw new Error('f must be a positive finite number');
	if (!Number.isInteger(channels) || channels <= 0)
		throw new Error('channels must be a positive integer');

	const n = input.length;
	if (n === 0) return new Int16Array(0);
	if (n % channels !== 0)
		throw new Error('input length must be a multiple of channels');

	// Parameters and sensible defaults
	const sampleRate = 48_000;
	const frameMs = 30; // 20–40 ms typical
	const overlapRatio = 0.5;
	const searchMs = 8; // +/- 8 ms local search
	const winKind = 'hann';
	const headReinf = 3;
	const tailReinf = 3;

	// Work per-channel
	const samplesPerChannel = (n / channels) | 0;

	// Frame and hop sizing
	const frameSize = Math.max(128, Math.floor((sampleRate * frameMs) / 1_000));
	const overlap = Math.floor(frameSize * overlapRatio);
	const anaHop = Math.max(1, frameSize - overlap);
	const synHop = Math.max(1, Math.round(anaHop * f));

	// Search radius in samples
	const searchRadius = Math.max(0, Math.floor((sampleRate * searchMs) / 1_000));

	// Window
	const win = new Float32Array(frameSize);
	for (let i = 0; i < frameSize; i++) {
		const x = (Math.PI * 2 * i) / (frameSize - 1);
		win[i] =
			winKind === 'hann' ? 0.5 * (1 - Math.cos(x)) : 0.54 - 0.46 * Math.cos(x); // Hamming
	}

	// Estimate output length per channel and allocate with extra headroom
	const estFrames = Math.max(
		1,
		Math.ceil(Math.max(0, samplesPerChannel - frameSize) / anaHop) + 1,
	);
	const estLen = Math.max(0, frameSize + synHop * (estFrames - 1));
	const extraHead = frameSize * (headReinf + 1);
	const extraTail = frameSize * (tailReinf + 2);
	const outLenAlloc = estLen + searchRadius + extraHead + extraTail;

	const out = Array.from(
		{length: channels},
		() => new Float32Array(outLenAlloc),
	);
	const outWeight = new Float32Array(outLenAlloc);

	// Temporary buffers
	const chanFrames = Array.from(
		{length: channels},
		() => new Float32Array(frameSize),
	);
	const guideFrame = new Float32Array(frameSize);

	// Helpers
	function readChannelFrame(chan: number, start: number, dst: Float32Array) {
		let srcIndex = start * channels + chan;
		for (let i = 0; i < frameSize; i++) {
			const pos = start + i;
			dst[i] = pos >= 0 && pos < samplesPerChannel ? input[srcIndex] : 0;
			srcIndex += channels;
		}
	}

	function readGuideFrame(start: number) {
		for (let i = 0; i < frameSize; i++) {
			const pos = start + i;
			if (pos >= 0 && pos < samplesPerChannel) {
				let sum = 0;
				const base = pos * channels;
				for (let c = 0; c < channels; c++) sum += input[base + c];
				guideFrame[i] = sum / channels;
			} else {
				guideFrame[i] = 0;
			}
		}
	}

	// Find best local alignment around outPos using normalized cross-correlation
	function bestAlignment(outPoss: number): number {
		let bestShift = 0;
		let bestScore = -Infinity;
		for (let shift = -searchRadius; shift <= searchRadius; shift++) {
			const pos = outPoss + shift - overlap;
			let score = 0;
			let normA = 0;
			let normB = 0;
			for (let i = 0; i < overlap; i++) {
				const idx = pos + i;
				const outVal = idx >= 0 && idx < outLenAlloc ? out[0][idx] : 0; // channel 0 proxy
				const frmVal = guideFrame[i];
				score += outVal * frmVal;
				normA += outVal * outVal;
				normB += frmVal * frmVal;
			}

			const denom = Math.sqrt((normA || 1e-9) * (normB || 1e-9));
			const corr = score / denom;
			if (corr > bestScore) {
				bestScore = corr;
				bestShift = shift;
			}
		}

		return bestShift;
	}

	// Overlap-add a frame for all channels at writeStart with windowing
	function olaAllChannels(writeStart: number) {
		for (let c = 0; c < channels; c++) {
			for (let i = 0; i < frameSize; i++) {
				const idx = writeStart + i;
				if (idx >= 0 && idx < outLenAlloc) {
					const w = win[i];
					out[c][idx] += chanFrames[c][i] * w;
					if (c === 0) outWeight[idx] += w; // track weights once
				}
			}
		}
	}

	// 1) Seed: place the first frame at t=0
	readGuideFrame(0);
	for (let c = 0; c < channels; c++) readChannelFrame(c, 0, chanFrames[c]);
	olaAllChannels(0);

	// 2) Head reinforcement: place extra frames whose writeStart <= 0
	for (let h = 0; h < headReinf; h++) {
		// Option 1: reuse the first analysis position to strengthen early region
		const headIn = Math.min(
			anaHop * h,
			Math.max(0, samplesPerChannel - frameSize),
		);
		readGuideFrame(headIn);
		for (let c = 0; c < channels; c++)
			readChannelFrame(c, headIn, chanFrames[c]);
		// Align around outPos=0 so we bias writeStart near/before 0
		const shift = bestAlignment(0);
		const writeStart = shift - overlap; // likely negative; ok, we clamp on write
		olaAllChannels(writeStart);
	}

	// 3) Main WSOLA loop
	let inPos = anaHop; // next analysis position (we already seeded at 0)
	let outPos = synHop; // next synthesis position

	while (inPos < samplesPerChannel - 1) {
		readGuideFrame(inPos);
		for (let c = 0; c < channels; c++)
			readChannelFrame(c, inPos, chanFrames[c]);

		const shift = bestAlignment(outPos);
		const writeStart = outPos + shift - overlap;
		olaAllChannels(writeStart);

		inPos += anaHop;
		outPos += synHop;

		// Safety: if we're very close to capacity, break to handle tail separately
		if (outPos > outLenAlloc - (frameSize + searchRadius + 8)) break;
	}

	// 4) Tail reinforcement: ensure the end gets full coverage
	// Place a few extra frames around the last outPos using the last available input frames.
	for (let t = 0; t < tailReinf; t++) {
		const tailIn = Math.max(
			0,
			Math.min(samplesPerChannel - frameSize, inPos - anaHop * t),
		);
		readGuideFrame(tailIn);
		for (let c = 0; c < channels; c++)
			readChannelFrame(c, tailIn, chanFrames[c]);

		const shift = bestAlignment(outPos);
		const writeStart = outPos + shift - overlap;
		olaAllChannels(writeStart);

		outPos += synHop;
	}

	// 5) Normalize by accumulated weights BEFORE trimming
	for (let i = 0; i < outLenAlloc; i++) {
		const w = outWeight[i];
		if (w > 1e-9) {
			const inv = 1 / w;
			for (let c = 0; c < channels; c++) out[c][i] *= inv;
		} else {
			for (let c = 0; c < channels; c++) out[c][i] = 0;
		}
	}

	// 6) Produce final interleaved Int16Array with length ≈ round(n * f)
	const targetPerChan = Math.max(1, Math.round(samplesPerChannel * f));
	const targetTotal = targetPerChan * channels;
	const result = new Int16Array(targetTotal);

	// Interleave and clamp/round
	for (let i = 0; i < targetPerChan; i++) {
		for (let c = 0; c < channels; c++) {
			const v = i < out[c].length ? out[c][i] : 0;
			const y = clamp16(v);
			result[i * channels + c] = y;
		}
	}

	return result;
}

/**
 * Reads a WAV file, applies WSOLA tempo modification, and writes it back.
 * Ignores the first 44 bytes (WAV header) and treats the rest as interleaved Int16 PCM.
 *
 * @param filePath Path to the WAV file to process
 * @param tempoFactor Tempo factor: >1 = faster/shorter, <1 = slower/longer
 */
export async function processWavFileWithWSOLA(
	filePath: string,
	tempoFactor: number,
): Promise<void> {
	const fs = await import('fs/promises');

	// Read the file
	const fileBuffer = await fs.readFile(filePath);

	// Skip first 44 bytes (WAV header) and create Int16Array
	const audioData = new Int16Array(fileBuffer.buffer, 44);

	// Apply WSOLA with 2 channels (stereo)
	const processedAudio = applyToneFrequency(
		audioData.length / 2,
		audioData,
		tempoFactor,
	);

	// Create new buffer with original header + processed audio
	const newBuffer = new Uint8Array(44 + processedAudio.length * 2);

	// Copy original header (first 44 bytes)
	newBuffer.set(fileBuffer.subarray(0, 44), 0);

	// Copy processed audio data
	const processedBytes = new Uint8Array(processedAudio.buffer);
	newBuffer.set(processedBytes, 44);

	// Write the processed file back
	await fs.writeFile(filePath, newBuffer);
}

import {DEFAULT_SAMPLE_RATE} from '../sample-rate';
import {resampleAudioData} from './resample-audiodata';

export const NUMBER_OF_CHANNELS = 2;

export const applyToneFrequency = (
	numberOfFrames: number,
	audioData: Int16Array,
	toneFrequency: number,
): Int16Array => {
	// In FFmpeg, we apply toneFrequency as follows:
	// `asetrate=${DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}`
	// So there are 2 steps:
	// 1. Change the assumed sample rate
	// 2. Resample to 48Khz
	// 3. Apply playback rate

	const step1SampleRate = DEFAULT_SAMPLE_RATE * toneFrequency;

	const newNumberOfFrames = Math.round(
		numberOfFrames * (DEFAULT_SAMPLE_RATE / step1SampleRate),
	);

	const step2Data = new Int16Array(newNumberOfFrames * NUMBER_OF_CHANNELS);

	const chunkSize = numberOfFrames / newNumberOfFrames;

	resampleAudioData({
		sourceChannels: audioData,
		destination: step2Data,
		targetFrames: newNumberOfFrames,
		chunkSize,
	});

	const step3Data = wsolaInt16Interleaved(
		step2Data,
		NUMBER_OF_CHANNELS,
		toneFrequency,
	);

	return step3Data;
};
