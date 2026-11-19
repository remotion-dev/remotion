import type {TRenderAsset} from 'remotion';
import {StreamingPitchShifter} from './streaming-pitch-shifter';

const TARGET_NUMBER_OF_CHANNELS = 2;

type PendingAudioFrame = {
	timestamp: number;
	mixed: Float64Array;
	pendingAssets: number;
};

type PitchShiftState = {
	shifter: StreamingPitchShifter;
	pending: {
		frame: PendingAudioFrame;
		written: number;
		start: number;
		length: number;
	}[];
};

// A shifter may need input from later video frames before it can finish an
// earlier audio frame. Keep those frames until every contributing asset is ready.
export const createAudioMixer = ({
	startFrame,
	fps,
	sampleRate,
}: {
	fps: number;
	sampleRate: number;
	startFrame: number;
}) => {
	const toneFrequencies = new Map<string, number>();
	const shifters = new Map<string, PitchShiftState>();
	const pendingFrames: PendingAudioFrame[] = [];
	let frameIndex = startFrame;

	const mixShiftedOutput = (state: PitchShiftState, output: Float32Array[]) => {
		let offset = 0;
		while (offset < output[0].length) {
			const pending = state.pending[0];
			const frameLength = pending.length;
			const count = Math.min(
				frameLength - pending.written,
				output[0].length - offset,
			);
			for (let i = 0; i < count; i++) {
				for (let channel = 0; channel < TARGET_NUMBER_OF_CHANNELS; channel++) {
					pending.frame.mixed[
						(pending.start + pending.written + i) * TARGET_NUMBER_OF_CHANNELS +
							channel
					] += output[channel][offset + i] * 32768;
				}
			}

			pending.written += count;
			offset += count;
			if (pending.written === frameLength) {
				pending.frame.pendingAssets--;
				state.pending.shift();
			}
		}
	};

	return {
		addFrame: ({
			assets,
			timestamp,
			outputFrame,
			isLastFrame,
		}: {
			assets: TRenderAsset[];
			timestamp: number;
			outputFrame: number | null;
			isLastFrame: boolean;
		}) => {
			const inlineAudio = assets.filter(
				(asset) => asset.type === 'inline-audio',
			);
			const activeIds = new Set(inlineAudio.map((asset) => asset.id));
			for (const [id, state] of shifters) {
				if (!activeIds.has(id)) {
					mixShiftedOutput(state, state.shifter.finalize());
					shifters.delete(id);
				}
			}

			// Round sample boundaries cumulatively so fractional samples per video
			// frame do not accumulate into audio/video drift.
			const samplesPerFrame = sampleRate / fps;
			const firstSample =
				outputFrame === null
					? Math.round((frameIndex * sampleRate) / fps)
					: Math.round(outputFrame * samplesPerFrame);
			const endSample =
				outputFrame === null
					? Math.round(((frameIndex + 1) * sampleRate) / fps)
					: Math.round((outputFrame + 1) * samplesPerFrame);
			const numberOfFrames = endSample - firstSample;
			frameIndex++;
			const frame: PendingAudioFrame = {
				timestamp,
				mixed: new Float64Array(numberOfFrames * TARGET_NUMBER_OF_CHANNELS),
				pendingAssets: 0,
			};
			pendingFrames.push(frame);

			for (const asset of inlineAudio) {
				const previousFrequency = toneFrequencies.get(asset.id);
				if (
					previousFrequency !== undefined &&
					previousFrequency !== asset.toneFrequency
				) {
					throw new Error(
						`toneFrequency must be the same across the entire audio, got ${asset.toneFrequency}, but before it was ${previousFrequency}`,
					);
				}

				toneFrequencies.set(asset.id, asset.toneFrequency);
				const start =
					asset.startSample === null ? 0 : asset.startSample - firstSample;
				const length =
					asset.startSample === null
						? numberOfFrames
						: Math.min(
								asset.audio.length / TARGET_NUMBER_OF_CHANNELS,
								numberOfFrames - start,
							);
				if (length <= 0) continue;
				if (asset.toneFrequency === 1) {
					for (
						let i = 0;
						i <
						Math.min(asset.audio.length, length * TARGET_NUMBER_OF_CHANNELS);
						i++
					) {
						frame.mixed[start * TARGET_NUMBER_OF_CHANNELS + i] +=
							asset.audio[i];
					}

					continue;
				}

				let state = shifters.get(asset.id);
				if (!state) {
					state = {
						shifter: new StreamingPitchShifter({
							numberOfChannels: TARGET_NUMBER_OF_CHANNELS,
							sampleRate,
							toneFrequency: asset.toneFrequency,
						}),
						pending: [],
					};
					shifters.set(asset.id, state);
				}

				const planar = Array.from(
					{length: TARGET_NUMBER_OF_CHANNELS},
					(_, channel) => {
						const data = new Float32Array(length);
						for (let i = 0; i < length; i++) {
							data[i] =
								(asset.audio[i * TARGET_NUMBER_OF_CHANNELS + channel] ?? 0) /
								32768;
						}

						return data;
					},
				);
				frame.pendingAssets++;
				state.pending.push({frame, written: 0, start, length});
				mixShiftedOutput(state, state.shifter.append(planar));
			}

			if (isLastFrame) {
				for (const state of shifters.values()) {
					mixShiftedOutput(state, state.shifter.finalize());
				}

				shifters.clear();
			}
		},
		getReadyAudio: (): AudioData | null => {
			const frame = pendingFrames[0];
			if (!frame || frame.pendingAssets > 0) {
				return null;
			}

			pendingFrames.shift();
			const data = new Int16Array(frame.mixed.length);
			for (let i = 0; i < data.length; i++) {
				data[i] = Math.max(-32768, Math.min(32767, frame.mixed[i]));
			}

			return new AudioData({
				data,
				format: 's16',
				numberOfChannels: TARGET_NUMBER_OF_CHANNELS,
				numberOfFrames: data.length / TARGET_NUMBER_OF_CHANNELS,
				sampleRate,
				timestamp: frame.timestamp,
			});
		},
	};
};
