// AudioWorkletProcessor that applies a pure, duration-preserving pitch shift to
// its input using the clean-room WSOLA implementation from core. It is bundled
// (with the WSOLA code inlined) into `source.ts` by `build.mjs` and loaded via
// a Blob URL at runtime (see `ensure-pitch-worklet.ts`).
//
// The processor only performs the pitch shift; the tempo change stays on the
// native `AudioBufferSourceNode.playbackRate`, so the whole scheduler is
// untouched. The pitch ratio `P` is computed in the main thread and pushed in
// via `processorOptions` and `port` messages.

import {NoReactInternals} from 'remotion/no-react';

// Minimal ambient declarations for the AudioWorklet global scope (not part of
// the default TS DOM lib).
declare const sampleRate: number;
declare function registerProcessor(
	name: string,
	processorCtor: typeof AudioWorkletProcessorPolyfill,
): void;
declare class AudioWorkletProcessorPolyfill {
	readonly port: MessagePort;
	constructor(options?: {processorOptions?: {pitchRatio?: number}});
	process(
		inputs: Float32Array[][],
		outputs: Float32Array[][],
		parameters: Record<string, Float32Array>,
	): boolean;
}

const RENDER_QUANTUM = 128;

class PitchShifterProcessor extends AudioWorkletProcessorPolyfill {
	private shifter: InstanceType<
		typeof NoReactInternals.WsolaPitchShifter
	> | null = null;

	private pitchRatio: number;

	// Per-channel output FIFO. All channels share `fifoLength`/`fifoHead`.
	private fifo: Float32Array[] = [];
	private fifoHead = 0;
	private fifoLength = 0;

	constructor(options?: {processorOptions?: {pitchRatio?: number}}) {
		super(options);
		this.pitchRatio = options?.processorOptions?.pitchRatio ?? 1;

		this.port.onmessage = (event: MessageEvent) => {
			const data = event.data as
				| {type: 'pitchRatio'; value: number}
				| {type: 'reset'};

			if (data.type === 'pitchRatio') {
				this.pitchRatio = data.value;
				this.shifter?.setPitchRatio(data.value);
			} else if (data.type === 'reset') {
				this.shifter?.reset();
				this.fifo = this.fifo.map((c) => new Float32Array(c.length));
				this.fifoHead = 0;
				this.fifoLength = 0;
			}
		};
	}

	private ensureShifter(channels: number) {
		if (this.shifter) {
			return;
		}

		this.shifter = new NoReactInternals.WsolaPitchShifter({
			sampleRate,
			channels,
		});
		this.shifter.setPitchRatio(this.pitchRatio);
		this.fifo = [];
		for (let c = 0; c < channels; c++) {
			this.fifo.push(new Float32Array(RENDER_QUANTUM * 8));
		}
	}

	private pushToFifo(produced: Float32Array[]) {
		const channels = this.fifo.length;
		const addLength = produced[0]?.length ?? 0;
		if (addLength === 0) {
			return;
		}

		// Compact / grow so the new samples fit after the current tail.
		const tail = this.fifoHead + this.fifoLength;
		if (tail + addLength > this.fifo[0].length) {
			const newCapacity = Math.max(
				this.fifo[0].length * 2,
				this.fifoLength + addLength,
			);
			for (let c = 0; c < channels; c++) {
				const next = new Float32Array(newCapacity);
				next.set(
					this.fifo[c].subarray(this.fifoHead, this.fifoHead + this.fifoLength),
				);
				this.fifo[c] = next;
			}

			this.fifoHead = 0;
		}

		const writeAt = this.fifoHead + this.fifoLength;
		for (let c = 0; c < channels; c++) {
			this.fifo[c].set(produced[c] ?? new Float32Array(addLength), writeAt);
		}

		this.fifoLength += addLength;
	}

	process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
		const output = outputs[0];
		if (!output || output.length === 0) {
			return true;
		}

		const channels = output.length;
		this.ensureShifter(channels);

		const input = inputs[0];
		const inputChannels: Float32Array[] = [];
		for (let c = 0; c < channels; c++) {
			inputChannels.push(
				input && input[c] ? input[c] : new Float32Array(RENDER_QUANTUM),
			);
		}

		const produced = (
			this.shifter as InstanceType<typeof NoReactInternals.WsolaPitchShifter>
		).process(inputChannels);
		this.pushToFifo(produced);

		const available = Math.min(RENDER_QUANTUM, this.fifoLength);
		for (let c = 0; c < channels; c++) {
			for (let i = 0; i < available; i++) {
				output[c][i] = this.fifo[c][this.fifoHead + i];
			}

			for (let i = available; i < RENDER_QUANTUM; i++) {
				output[c][i] = 0;
			}
		}

		this.fifoHead += available;
		this.fifoLength -= available;

		return true;
	}
}

registerProcessor('remotion-pitch-shifter', PitchShifterProcessor);
