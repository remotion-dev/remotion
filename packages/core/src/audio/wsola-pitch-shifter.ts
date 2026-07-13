// Clean-room implementation of a duration-preserving pitch shifter.
//
// This module is implemented from the published WSOLA (Waveform Similarity
// Overlap-Add) algorithm as described by Verhelst & Roelands, "An overlap-add
// technique based on waveform similarity (WSOLA) for high quality time-scale
// modification of speech" (ICASSP 1993). No code was copied from any existing
// implementation; in particular no LGPL-licensed code (SoundTouch /
// @soundtouchjs) was used or referenced.
//
// A pure pitch shift by ratio `P` (1:1 sample count, duration-preserving) is
// obtained by first time-stretching the signal by `P` using WSOLA (same pitch,
// `P`× the duration) and then resampling it back down by `P` using linear
// interpolation (restores the duration, raises the pitch by `P`). `P === 1` is
// a bit-exact passthrough.
//
// The same class works both streaming (an AudioWorklet feeds 128-sample
// quanta) and offline (the renderer feeds the whole per-asset buffer in a few
// large chunks and calls `flush()`).

// A growable FIFO of Float32 samples with absolute indexing. Consumed samples
// are dropped by advancing `base`; the backing buffer is compacted lazily.
class SampleQueue {
	private data: Float32Array;
	private head = 0;
	private tail = 0;
	// Absolute index (across the whole stream) of the sample at `head`.
	public base = 0;

	constructor(initialCapacity: number) {
		this.data = new Float32Array(Math.max(initialCapacity, 16));
	}

	// Number of samples currently stored.
	get length(): number {
		return this.tail - this.head;
	}

	// Absolute index one past the last stored sample.
	get end(): number {
		return this.base + this.length;
	}

	append(chunk: Float32Array): void {
		const needed = this.tail + chunk.length;
		if (needed > this.data.length) {
			// Compact first: move live samples to the front.
			const live = this.tail - this.head;
			if (this.head > 0) {
				this.data.copyWithin(0, this.head, this.tail);
				this.head = 0;
				this.tail = live;
			}

			if (live + chunk.length > this.data.length) {
				const newCapacity = Math.max(this.data.length * 2, live + chunk.length);
				const next = new Float32Array(newCapacity);
				next.set(this.data.subarray(0, this.tail));
				this.data = next;
			}
		}

		this.data.set(chunk, this.tail);
		this.tail += chunk.length;
	}

	// Read `length` samples starting at absolute index `absStart` into `out`.
	// Positions before `base` or past `end` are read as zeros (needed while
	// flushing tail grains that reference not-yet-available samples).
	readInto(out: Float32Array, absStart: number, length: number): void {
		for (let i = 0; i < length; i++) {
			const abs = absStart + i;
			const rel = abs - this.base + this.head;
			out[i] = abs < this.base || abs >= this.end ? 0 : this.data[rel];
		}
	}

	sampleAt(abs: number): number {
		if (abs < this.base || abs >= this.end) {
			return 0;
		}

		return this.data[abs - this.base + this.head];
	}

	// Drop all samples with an absolute index below `abs`.
	discardBefore(abs: number): void {
		if (abs <= this.base) {
			return;
		}

		const toDrop = Math.min(abs - this.base, this.length);
		this.head += toDrop;
		this.base += toDrop;
	}

	reset(): void {
		this.head = 0;
		this.tail = 0;
		this.base = 0;
	}
}

export type WsolaPitchShifterOptions = {
	sampleRate: number;
	channels: number;
};

export class WsolaPitchShifter {
	private readonly channels: number;
	private readonly frameSize: number;
	private readonly synthesisHop: number;
	private readonly seekWindow: number;
	private readonly searchRadius: number;
	private readonly window: Float32Array;

	private pitchRatio = 1;
	private analysisHop: number;

	// Per-channel state.
	private readonly input: SampleQueue[];
	private readonly stretched: SampleQueue[];
	private readonly olaTail: Float32Array[];

	// WSOLA analysis state (shared across channels so the stereo image is kept).
	private idealAnalysis = 0;
	private prevChosen = 0;
	private grainsSynthesized = 0;

	// Absolute read position within the (time-stretched) intermediate signal.
	private resamplePos = 0;

	// Scratch buffers reused across grains to avoid per-grain allocation.
	private readonly scratchFrame: Float32Array;
	private readonly scratchTarget: Float32Array;
	private readonly scratchCandidate: Float32Array;

	constructor({sampleRate, channels}: WsolaPitchShifterOptions) {
		this.channels = channels;

		// ~50 ms window, 50 % overlap, ~20 ms similarity window, ~10 ms search.
		const frame = Math.max(64, Math.round(sampleRate * 0.05));
		this.frameSize = frame % 2 === 0 ? frame : frame + 1;
		this.synthesisHop = this.frameSize / 2;
		this.seekWindow = Math.min(
			this.frameSize,
			Math.max(32, Math.round(sampleRate * 0.02)),
		);
		this.searchRadius = Math.max(1, Math.round(sampleRate * 0.01));
		this.analysisHop = this.synthesisHop; // P === 1 default.

		this.window = new Float32Array(this.frameSize);
		for (let i = 0; i < this.frameSize; i++) {
			this.window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / this.frameSize));
		}

		this.input = [];
		this.stretched = [];
		this.olaTail = [];
		for (let c = 0; c < channels; c++) {
			this.input.push(new SampleQueue(this.frameSize * 4));
			this.stretched.push(new SampleQueue(this.frameSize * 4));
			this.olaTail.push(new Float32Array(this.synthesisHop));
		}

		this.scratchFrame = new Float32Array(this.frameSize);
		this.scratchTarget = new Float32Array(this.seekWindow);
		this.scratchCandidate = new Float32Array(this.seekWindow);
	}

	setPitchRatio(pitchRatio: number): void {
		if (pitchRatio <= 0 || !Number.isFinite(pitchRatio)) {
			return;
		}

		this.pitchRatio = pitchRatio;
		// Time-stretch by factor `α = P` (Hs / Ha = α ⇒ Ha = Hs / P), then the
		// resampler decimates by `P` to restore the duration and raise the pitch.
		this.analysisHop = this.synthesisHop / pitchRatio;
	}

	getPitchRatio(): number {
		return this.pitchRatio;
	}

	reset(): void {
		for (let c = 0; c < this.channels; c++) {
			this.input[c].reset();
			this.stretched[c].reset();
			this.olaTail[c].fill(0);
		}

		this.idealAnalysis = 0;
		this.prevChosen = 0;
		this.grainsSynthesized = 0;
		this.resamplePos = 0;
	}

	// Find the analysis offset (relative to `center`) whose frame best matches
	// the natural continuation of the previously placed frame. Uses a mono mix
	// of all channels so the same offset can be applied to every channel.
	private findBestOffset(center: number): number {
		const {seekWindow, searchRadius} = this;
		const target = this.scratchTarget;
		const candidate = this.scratchCandidate;

		// Target = the segment following the previously chosen frame by one
		// synthesis hop (what the ear expects to hear next).
		const targetStart = this.prevChosen + this.synthesisHop;
		target.fill(0);
		for (let i = 0; i < seekWindow; i++) {
			let sum = 0;
			for (let c = 0; c < this.channels; c++) {
				sum += this.input[c].sampleAt(targetStart + i);
			}

			target[i] = sum;
		}

		let targetEnergy = 0;
		for (let i = 0; i < seekWindow; i++) {
			targetEnergy += target[i] * target[i];
		}

		if (targetEnergy === 0) {
			return 0;
		}

		let bestOffset = 0;
		let bestScore = -Infinity;
		for (let delta = -searchRadius; delta <= searchRadius; delta++) {
			const start = center + delta;
			candidate.fill(0);
			for (let i = 0; i < seekWindow; i++) {
				let sum = 0;
				for (let c = 0; c < this.channels; c++) {
					sum += this.input[c].sampleAt(start + i);
				}

				candidate[i] = sum;
			}

			let cross = 0;
			let energy = 0;
			for (let i = 0; i < seekWindow; i++) {
				cross += candidate[i] * target[i];
				energy += candidate[i] * candidate[i];
			}

			// Normalized cross-correlation (target energy is constant across
			// candidates, so it is omitted from the comparison).
			const score = energy === 0 ? 0 : cross / Math.sqrt(energy);
			if (score > bestScore) {
				bestScore = score;
				bestOffset = delta;
			}
		}

		return bestOffset;
	}

	// Synthesize one WSOLA grain into the intermediate (time-stretched) queues.
	private synthesizeGrain(): void {
		const center = Math.round(this.idealAnalysis);

		let chosen: number;
		if (this.grainsSynthesized === 0) {
			chosen = center;
		} else {
			chosen = center + this.findBestOffset(center);
		}

		const frame = this.scratchFrame;
		const {frameSize, synthesisHop, window} = this;

		for (let c = 0; c < this.channels; c++) {
			this.input[c].readInto(frame, chosen, frameSize);

			const tail = this.olaTail[c];
			const out = new Float32Array(synthesisHop);
			// The first half overlaps the previous grain's tail (COLA: a Hann
			// window at 50 % overlap sums to unity), the second half becomes the
			// new tail.
			for (let i = 0; i < synthesisHop; i++) {
				out[i] = tail[i] + frame[i] * window[i];
			}

			for (let i = 0; i < synthesisHop; i++) {
				tail[i] = frame[synthesisHop + i] * window[synthesisHop + i];
			}

			this.stretched[c].append(out);
		}

		this.prevChosen = chosen;
		this.idealAnalysis += this.analysisHop;
		this.grainsSynthesized++;
	}

	// True while enough input is buffered to safely synthesize the next grain.
	private canSynthesize(): boolean {
		const center = Math.round(this.idealAnalysis);
		const neededForFrame = center + this.searchRadius + this.frameSize;
		const neededForTarget =
			this.prevChosen + this.synthesisHop + this.seekWindow;
		const needed = Math.max(neededForFrame, neededForTarget);
		return this.input[0].end >= needed;
	}

	private dropConsumedInput(): void {
		// The earliest sample any future grain can reference.
		const earliest = Math.round(this.idealAnalysis) - this.searchRadius;
		if (earliest <= 0) {
			return;
		}

		for (let c = 0; c < this.channels; c++) {
			this.input[c].discardBefore(earliest);
		}
	}

	// Resample the intermediate queues by `P` using linear interpolation and
	// return the produced output. Only emits samples whose interpolation
	// neighbours are already available.
	private resample(): Float32Array[] {
		const {pitchRatio} = this;
		const available = this.stretched[0].end;

		// Highest resample position for which floor+1 is available.
		let count = 0;
		{
			let probe = this.resamplePos;
			while (Math.floor(probe) + 1 < available) {
				count++;
				probe += pitchRatio;
			}
		}

		const out: Float32Array[] = [];
		for (let c = 0; c < this.channels; c++) {
			out.push(new Float32Array(count));
		}

		let pos = this.resamplePos;
		for (let n = 0; n < count; n++) {
			const i0 = Math.floor(pos);
			const frac = pos - i0;
			for (let c = 0; c < this.channels; c++) {
				const a = this.stretched[c].sampleAt(i0);
				const b = this.stretched[c].sampleAt(i0 + 1);
				out[c][n] = a + (b - a) * frac;
			}

			pos += pitchRatio;
		}

		this.resamplePos = pos;

		// Drop intermediate samples that can no longer be referenced.
		const keepFrom = Math.max(0, Math.floor(this.resamplePos));
		for (let c = 0; c < this.channels; c++) {
			this.stretched[c].discardBefore(keepFrom);
		}

		return out;
	}

	private runGrains(): void {
		while (this.canSynthesize()) {
			this.synthesizeGrain();
		}

		this.dropConsumedInput();
	}

	// Feed input (one Float32Array per channel) and receive whatever output is
	// ready (one Float32Array per channel, possibly length 0 during warm-up).
	process(inputChannels: Float32Array[]): Float32Array[] {
		if (this.pitchRatio === 1) {
			// Bit-exact passthrough.
			return inputChannels.map((c) => c.slice());
		}

		for (let c = 0; c < this.channels; c++) {
			this.input[c].append(inputChannels[c] ?? new Float32Array(0));
		}

		this.runGrains();
		return this.resample();
	}

	// Drain the remaining buffered input (zero-padded) and return the final
	// output. After `flush()` the shifter must be `reset()` before reuse.
	flush(): Float32Array[] {
		if (this.pitchRatio === 1) {
			return this.input.map(() => new Float32Array(0));
		}

		// Feed enough silence so every buffered input sample gets emitted.
		const pad = new Float32Array(this.frameSize + this.searchRadius);
		for (let c = 0; c < this.channels; c++) {
			this.input[c].append(pad);
		}

		this.runGrains();
		return this.resample();
	}
}
