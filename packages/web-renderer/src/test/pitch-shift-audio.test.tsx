import {Audio, Video} from '@remotion/media';
import {ALL_FORMATS, AudioBufferSink, BlobSource, Input} from 'mediabunny';
import {useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import {makeToneWav, pitchShiftAudio} from './fixtures/pitch-shift-audio';
import '../symbol-dispose';

// Measure both requested tones in overlapping regions, where zero crossings
// cannot distinguish which asset was pitch shifted.
const amplitudeAt = (
	audio: Float32Array,
	sampleRate: number,
	range: [number, number],
	frequency: number,
) => {
	let real = 0;
	let imaginary = 0;
	const from = Math.round(range[0] * sampleRate);
	const to = Math.round(range[1] * sampleRate);
	for (let i = from; i < to; i++) {
		const phase = (i / sampleRate) * frequency * Math.PI * 2;
		real += audio[i] * Math.cos(phase);
		imaginary += audio[i] * Math.sin(phase);
	}

	return (2 * Math.hypot(real, imaginary)) / (to - from);
};

test.each([48000, 44100])(
	'renders pitch-shifted stereo audio at %i Hz with preserved timing',
	async (sampleRate) => {
		const result = await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {...pitchShiftAudio, calculateMetadata: null},
			container: 'wav',
			outputTarget: 'arraybuffer',
			sampleRate,
		});
		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await result.getBlob()),
		});
		const track = await input.getPrimaryAudioTrack();
		expect(track).not.toBeNull();
		const channels = [
			new Float32Array(sampleRate * 2),
			new Float32Array(sampleRate * 2),
		];
		let totalSamples = 0;
		for await (const {buffer, timestamp} of new AudioBufferSink(
			track!,
		).buffers()) {
			expect(timestamp).toBeCloseTo(totalSamples / sampleRate, 5);
			for (let channel = 0; channel < 2; channel++) {
				channels[channel].set(buffer.getChannelData(channel), totalSamples);
			}

			totalSamples += buffer.length;
		}

		expect(totalSamples).toBe(sampleRate * 2);
		for (let channel = 0; channel < 2; channel++) {
			const sourceFrequency = channel === 0 ? 440 : 660;
			const lower = sourceFrequency * 0.75;
			// The rendering playbackRate resampler also scales pitch.
			const higher = sourceFrequency * 1.5 * 1.25;
			const audio = channels[channel];
			expect(amplitudeAt(audio, sampleRate, [0.2, 0.4], lower)).toBeGreaterThan(
				0.2,
			);
			expect(
				amplitudeAt(audio, sampleRate, [0.2, 0.4], sourceFrequency),
			).toBeLessThan(0.02);
			expect(
				amplitudeAt(audio, sampleRate, [0.65, 0.85], lower),
			).toBeGreaterThan(0.2);
			expect(
				amplitudeAt(audio, sampleRate, [0.65, 0.85], higher),
			).toBeGreaterThan(0.15);
			expect(
				amplitudeAt(audio, sampleRate, [1.1, 1.3], higher),
			).toBeGreaterThan(0.15);
			expect(
				amplitudeAt(audio, sampleRate, [1.55, 1.7], sourceFrequency),
			).toBeGreaterThan(0.2);
			expect(
				audio
					.subarray(Math.round(1.8 * sampleRate), Math.round(1.96 * sampleRate))
					.every((sample) => sample === 0),
			).toBe(true);
			// Even a one-frame clip must be flushed before finalizing the output.
			expect(
				audio
					.subarray(Math.round((59 / 30) * sampleRate))
					.some((sample) => Math.abs(sample) > 0.1),
			).toBe(true);

			// A reset at each video frame produces discontinuities in this sine wave.
			for (let frame = 3; frame < 12; frame++) {
				const boundary = Math.round((frame / 30) * sampleRate);
				expect(Math.abs(audio[boundary] - audio[boundary - 1])).toBeLessThan(
					0.05,
				);
			}
		}
	},
);

test('rejects changing toneFrequency, including after a silent gap', async () => {
	const src = makeToneWav();
	for (const initialFrequency of [1, 0.75]) {
		const Component: React.FC = () => {
			const frame = useCurrentFrame();
			return (
				<Audio
					src={src}
					muted={frame === 1}
					toneFrequency={frame < 2 ? initialFrequency : 1.5}
				/>
			);
		};

		await expect(
			renderMediaOnWeb({
				licenseKey: 'free-license',
				composition: {
					...pitchShiftAudio,
					component: Component,
					durationInFrames: 3,
					calculateMetadata: null,
				},
				container: 'wav',
				outputTarget: 'arraybuffer',
			}),
		).rejects.toThrow(
			`toneFrequency must be the same across the entire audio, got 1.5, but before it was ${initialFrequency}`,
		);
	}
});

test('renders a partial frame range with video and pitch shifts Video audio', async () => {
	const renderedVideo = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {...pitchShiftAudio, calculateMetadata: null},
		frameRange: [15, 44],
		outputTarget: 'arraybuffer',
	});
	const src = URL.createObjectURL(await renderedVideo.getBlob());
	try {
		const Component: React.FC = () => <Video src={src} toneFrequency={0.8} />;
		const result = await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				...pitchShiftAudio,
				component: Component,
				durationInFrames: 30,
				calculateMetadata: null,
			},
			container: 'wav',
			outputTarget: 'arraybuffer',
		});
		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await result.getBlob()),
		});
		const track = await input.getPrimaryAudioTrack();
		const audio = new Float32Array(48000);
		let totalSamples = 0;
		for await (const {buffer, timestamp} of new AudioBufferSink(
			track!,
		).buffers()) {
			expect(timestamp).toBeCloseTo(totalSamples / 48000, 5);
			audio.set(buffer.getChannelData(0), totalSamples);
			totalSamples += buffer.length;
		}

		expect(totalSamples).toBe(48000);
		expect(
			amplitudeAt(audio, 48000, [0.2, 0.4], 440 * 0.75 * 0.8),
		).toBeGreaterThan(0.1);
		expect(
			amplitudeAt(audio, 48000, [0.65, 0.85], 440 * 1.25 * 1.5 * 0.8),
		).toBeGreaterThan(0.1);
	} finally {
		URL.revokeObjectURL(src);
	}
});

test.each([0.01, 2])(
	'flushes short clips and muted gaps at toneFrequency=%s',
	async (toneFrequency) => {
		const src = makeToneWav();
		const fps = 59.94;
		const sampleRate = 44100;
		const Component: React.FC = () => {
			const frame = useCurrentFrame();
			return (
				<Audio src={src} toneFrequency={toneFrequency} muted={frame === 4} />
			);
		};

		const result = await renderMediaOnWeb({
			licenseKey: 'free-license',
			composition: {
				...pitchShiftAudio,
				component: Component,
				fps,
				durationInFrames: 8,
				calculateMetadata: null,
			},
			frameRange: [2, 7],
			container: 'wav',
			outputTarget: 'arraybuffer',
			sampleRate,
		});
		using input = new Input({
			formats: ALL_FORMATS,
			source: new BlobSource(await result.getBlob()),
		});
		const track = await input.getPrimaryAudioTrack();
		const audio = new Float32Array(Math.round((6 * sampleRate) / fps));
		let totalSamples = 0;
		for await (const {buffer, timestamp} of new AudioBufferSink(
			track!,
		).buffers()) {
			expect(timestamp).toBeCloseTo(totalSamples / sampleRate, 5);
			audio.set(buffer.getChannelData(0), totalSamples);
			totalSamples += buffer.length;
		}

		expect(totalSamples).toBe(audio.length);
		const gapStart = Math.round((2 * sampleRate) / fps);
		const gapEnd = Math.round((3 * sampleRate) / fps);
		expect(
			audio.subarray(0, gapStart).some((sample) => Math.abs(sample) > 0.1),
		).toBe(true);
		expect(
			audio.subarray(gapStart, gapEnd).every((sample) => sample === 0),
		).toBe(true);
		expect(
			audio.subarray(gapEnd).some((sample) => Math.abs(sample) > 0.1),
		).toBe(true);
	},
);
