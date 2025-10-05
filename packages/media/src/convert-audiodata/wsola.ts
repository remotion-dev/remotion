function clamp16(x: number): number {
	const y = Math.round(x);
	return y < -32768 ? -32768 : y > 32767 ? 32767 : y;
}

/**
 * Time-scale modification (tempo change) with approximate pitch preservation
 * for interleaved Int16 PCM with multiple channels, using a SOLA/WSOLA-like method.
 *
 * @param input Interleaved Int16 PCM samples (e.g., LR LR LR ...)
 * @param channels Number of channels (e.g., 2 for stereo)
 * @param f Tempo factor: >1.0 = faster (shorter), <1.0 = slower (longer)
 * @param opts Optional tuning parameters
 * @returns Interleaved Int16 PCM with length ≈ round(input.length * f)
 */
export function atempoInt16Interleaved(
	input: Int16Array,
	channels: number,
	f: number,
): Int16Array {
	const sampleRate = 48000;
	if (!Number.isFinite(f) || f <= 0) {
		throw new Error('f must be a positive finite number');
	}

	if (!Number.isInteger(channels) || channels <= 0) {
		throw new Error('channels must be a positive integer');
	}

	const n = input.length;
	if (n === 0) return new Int16Array(0);
	if (n % channels !== 0) {
		throw new Error(
			'input length must be a multiple of channels (interleaved PCM)',
		);
	}

	const frameMs = Math.round(1000 * (1 / 24));
	const overlapRatio = 0.5;
	const searchMs = 15;

	// Work in samples per channel
	const samplesPerChannel = (n / channels) | 0;

	// Frame sizing and hops (per channel)
	const frameSize = Math.max(128, Math.floor((sampleRate * frameMs) / 1_000));
	const overlap = Math.floor(frameSize * overlapRatio);
	const anaHop = Math.max(1, frameSize - overlap);
	const synHop = Math.max(1, Math.round(anaHop * f));
	const searchRadius = Math.max(0, Math.floor((sampleRate * searchMs) / 1_000));

	// Window
	const win = new Float32Array(frameSize);
	for (let i = 0; i < frameSize; i++) {
		const x = (Math.PI * 2 * i) / (frameSize - 1);
		win[i] = 0.5 * (1 - Math.cos(x));
	}

	// Output buffers as float accumulators per channel
	const estFrames = Math.ceil((samplesPerChannel - frameSize) / anaHop) + 1;
	const estLen = Math.max(0, frameSize + synHop * (estFrames - 1));
	const outLenAlloc = estLen + frameSize + searchRadius + 16;

	const out = Array.from(
		{length: channels},
		() => new Float32Array(outLenAlloc),
	);
	const outWeight = new Float32Array(outLenAlloc);

	// Helper: read one channel’s frame from interleaved PCM
	function readChannelFrame(chan: number, start: number, dst: Float32Array) {
		// start is per-channel sample index
		let srcIndex = start * channels + chan;
		for (let i = 0; i < frameSize; i++) {
			const pos = start + i;
			let v = 0;
			if (pos >= 0 && pos < samplesPerChannel) {
				v = input[srcIndex];
			}

			dst[i] = v;
			srcIndex += channels;
		}
	}

	// Build a mono guide frame (mid/mono mix) to drive alignment
	const guideFrame = new Float32Array(frameSize);
	function readGuideFrame(start: number) {
		for (let i = 0; i < frameSize; i++) {
			const pos = start + i;
			if (pos >= 0 && pos < samplesPerChannel) {
				let sum = 0;
				const base = (pos * channels) | 0;
				for (let c = 0; c < channels; c++) {
					sum += input[base + c];
				}

				guideFrame[i] = sum / channels;
			} else {
				guideFrame[i] = 0;
			}
		}
	}

	// Cross-correlation on overlap region using guide to find best local alignment
	function bestAlignment(outPoss: number, baseShift: number): number {
		let bestShift = baseShift;
		let bestScore = -Infinity;

		for (let shift = -searchRadius; shift <= searchRadius; shift++) {
			const pos = outPoss + shift - overlap;
			let score = 0;
			let normA = 0;
			let normB = 0;

			for (let i = 0; i < overlap; i++) {
				const outIdx = pos + i;
				const outVal = outIdx >= 0 && outIdx < outLenAlloc ? out[0][outIdx] : 0; // use channel 0 accumulator as proxy
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

	// Temp buffers per channel
	const chanFrames = Array.from(
		{length: channels},
		() => new Float32Array(frameSize),
	);

	let inPos = 0; // per-channel sample index
	let outPos = 0; // per-channel sample index in accumulators

	// First frame: place directly
	readGuideFrame(0);
	for (let c = 0; c < channels; c++) {
		readChannelFrame(c, 0, chanFrames[c]);
		for (let i = 0; i < frameSize; i++) {
			const w = win[i];
			const idx = i; // write starting at 0
			out[c][idx] += chanFrames[c][i] * w;
			if (c === 0) outWeight[idx] += w;
		}
	}

	inPos += anaHop;
	outPos += synHop;

	// Process remaining frames
	while (inPos < samplesPerChannel - 1) {
		readGuideFrame(inPos);

		// Find best alignment using guide
		const shift = bestAlignment(outPos, 0);
		const writeStart = outPos + shift - overlap;

		// Windowed overlap-add for each channel using same alignment
		for (let c = 0; c < channels; c++) {
			readChannelFrame(c, inPos, chanFrames[c]);
			for (let i = 0; i < frameSize; i++) {
				const idx = writeStart + i;
				if (idx >= 0 && idx < outLenAlloc) {
					const w = win[i];
					out[c][idx] += chanFrames[c][i] * w;
					if (c === 0) outWeight[idx] += w;
				}
			}
		}

		inPos += anaHop;
		outPos += synHop;

		if (outPos + frameSize + searchRadius + 8 >= outLenAlloc) break;
	}

	// Normalize by accumulated window weights
	for (let i = 0; i < outLenAlloc; i++) {
		const w = outWeight[i];
		if (w > 1e-9) {
			const inv = 1 / w;
			for (let c = 0; c < channels; c++) {
				out[c][i] *= inv;
			}
		}
	}

	// Target per-channel length and interleave
	const targetPerChan = Math.max(1, Math.round(samplesPerChannel * f));
	const targetTotal = targetPerChan * channels;

	const result = new Int16Array(targetTotal);

	// Clamp/convert and interleave
	for (let i = 0; i < targetPerChan; i++) {
		for (let c = 0; c < channels; c++) {
			const v = i < out[c].length ? out[c][i] : 0;
			const y = clamp16(v);
			result[i * channels + c] = y;
		}
	}

	return result;
}
