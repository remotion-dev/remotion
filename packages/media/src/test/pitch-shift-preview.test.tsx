import {Player} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Sequence} from 'remotion';
import {expect, test, vi} from 'vitest';
import {Audio} from '../audio/audio';
import {Video} from '../video/video';

type ToneFrequencyProps = {
	readonly toneFrequency: number;
	readonly playbackRate: number;
	readonly preservePitch: boolean | undefined;
};

const makeSineWaveUrl = ({
	frequency,
	sampleRate,
	durationInSeconds,
}: {
	frequency: number;
	sampleRate: number;
	durationInSeconds: number;
}) => {
	const numberOfFrames = sampleRate * durationInSeconds;
	const bytesPerSample = 2;
	const dataLength = numberOfFrames * bytesPerSample;
	const buffer = new ArrayBuffer(44 + dataLength);
	const view = new DataView(buffer);
	const writeString = (offset: number, value: string) => {
		for (let index = 0; index < value.length; index++) {
			view.setUint8(offset + index, value.charCodeAt(index));
		}
	};

	writeString(0, 'RIFF');
	view.setUint32(4, 36 + dataLength, true);
	writeString(8, 'WAVE');
	writeString(12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, 1, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * bytesPerSample, true);
	view.setUint16(32, bytesPerSample, true);
	view.setUint16(34, bytesPerSample * 8, true);
	writeString(36, 'data');
	view.setUint32(40, dataLength, true);

	for (let frame = 0; frame < numberOfFrames; frame++) {
		const sample = Math.round(
			Math.sin((frame / sampleRate) * frequency * Math.PI * 2) * 16_000,
		);
		view.setInt16(44 + frame * bytesPerSample, sample, true);
	}

	return URL.createObjectURL(new Blob([buffer], {type: 'audio/wav'}));
};

const waitFor = async (predicate: () => boolean) => {
	const start = Date.now();
	while (Date.now() - start < 10_000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	throw new Error('Timed out while waiting for preview audio buffers.');
};

const estimateFrequency = ({
	audio,
	sampleRate,
}: {
	audio: Float32Array;
	sampleRate: number;
}) => {
	let positiveCrossings = 0;
	for (let frame = 1; frame < audio.length; frame++) {
		if (audio[frame - 1] <= 0 && audio[frame] > 0) {
			positiveCrossings++;
		}
	}

	return positiveCrossings / (audio.length / sampleRate);
};

// KINO-7177: authored and viewing speeds have independent pitch controls.
test('Audio and Video independently control authored and viewing-speed pitch', async () => {
	const src = makeSineWaveUrl({
		frequency: 440,
		sampleRate: 48_000,
		durationInSeconds: 1,
	});
	const originalCreateBufferSource = AudioContext.prototype.createBufferSource;
	const createdNodes: AudioBufferSourceNode[] = [];
	const createBufferSourceSpy = vi
		.spyOn(AudioContext.prototype, 'createBufferSource')
		.mockImplementation(function (this: AudioContext) {
			const node = originalCreateBufferSource.call(this);
			createdNodes.push(node);
			return node;
		});

	const verify = async (
		component: React.ComponentType<ToneFrequencyProps>,
		sampleRate: number,
		{
			playbackRate,
			parentRate,
			preservePitch,
		}: {
			playbackRate: number;
			parentRate: number;
			preservePitch: boolean | undefined;
		},
	) => {
		createdNodes.length = 0;
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		let setToneFrequency: React.Dispatch<React.SetStateAction<number>> | null =
			null;
		let setPlayerSpeed: React.Dispatch<React.SetStateAction<number>> | null =
			null;
		let setPlayerPreservePitch: React.Dispatch<
			React.SetStateAction<boolean | undefined>
		> | null = null;
		const StatefulComposition: React.FC = () => {
			const [toneFrequency, setCurrentToneFrequency] = React.useState(1);
			setToneFrequency = setCurrentToneFrequency;
			return (
				<Sequence playbackRate={parentRate}>
					{React.createElement(component, {
						toneFrequency,
						playbackRate,
						preservePitch,
					})}
				</Sequence>
			);
		};

		const StatefulPlayer = () => {
			const [playerSpeed, setSpeed] = React.useState(1);
			const [playerPreservePitch, setPitch] = React.useState<
				boolean | undefined
			>(undefined);
			setPlayerSpeed = setSpeed;
			setPlayerPreservePitch = setPitch;
			return (
				<Player
					playbackRate={playerSpeed}
					preservePitch={playerPreservePitch}
					acknowledgeRemotionLicense
					component={StatefulComposition}
					compositionHeight={100}
					compositionWidth={100}
					durationInFrames={30}
					fps={30}
					sampleRate={sampleRate}
					inputProps={{}}
				/>
			);
		};

		root.render(<StatefulPlayer />);

		try {
			await waitFor(
				() => createdNodes.filter((node) => node.buffer !== null).length >= 8,
			);
			const getScheduledFrequency = () => {
				for (const node of createdNodes) {
					expect(node.context.sampleRate).toBe(sampleRate);
				}

				const buffers = createdNodes
					.map((node) => node.buffer)
					.filter((buffer): buffer is AudioBuffer => buffer !== null);
				const samples = new Float32Array(
					buffers.reduce((sum, buffer) => sum + buffer.length, 0),
				);
				let offset = 0;
				for (const buffer of buffers) {
					samples.set(buffer.getChannelData(0), offset);
					offset += buffer.length;
				}

				return estimateFrequency({
					audio: samples,
					sampleRate: buffers[0].sampleRate,
				});
			};

			expect(getScheduledFrequency() * playbackRate * parentRate).toBeCloseTo(
				440 * (preservePitch ? 1 : playbackRate * parentRate),
				-1,
			);
			createdNodes.length = 0;
			if (!setToneFrequency) {
				throw new Error('Composition did not mount.');
			}

			flushSync(() => setToneFrequency?.(1.5));
			await waitFor(
				() => createdNodes.filter((node) => node.buffer !== null).length >= 8,
			);
			expect(getScheduledFrequency() * playbackRate * parentRate).toBeCloseTo(
				660 * (preservePitch ? 1 : playbackRate * parentRate),
				-1,
			);

			createdNodes.length = 0;
			flushSync(() => setPlayerSpeed?.(1.5));
			await waitFor(
				() => createdNodes.filter((node) => node.buffer !== null).length >= 8,
			);
			expect(
				getScheduledFrequency() * playbackRate * parentRate * 1.5,
			).toBeCloseTo(990 * (preservePitch ? 1 : playbackRate * parentRate), -1);

			createdNodes.length = 0;
			flushSync(() => setPlayerPreservePitch?.(true));
			await waitFor(
				() => createdNodes.filter((node) => node.buffer !== null).length >= 8,
			);
			expect(
				getScheduledFrequency() * playbackRate * parentRate * 1.5,
			).toBeCloseTo(660 * (preservePitch ? 1 : playbackRate * parentRate), -1);
		} finally {
			root.unmount();
			container.remove();
		}
	};

	const AudioComposition: React.FC<ToneFrequencyProps> = ({
		toneFrequency,
		playbackRate,
		preservePitch,
	}) => (
		<Audio
			disallowFallbackToHtml5Audio
			logLevel="error"
			src={src}
			toneFrequency={toneFrequency}
			playbackRate={playbackRate}
			preservePitch={preservePitch}
		/>
	);
	const VideoComposition: React.FC<ToneFrequencyProps> = ({
		toneFrequency,
		playbackRate,
		preservePitch,
	}) => (
		<Video
			disallowFallbackToOffthreadVideo
			headless
			logLevel="error"
			src={src}
			toneFrequency={toneFrequency}
			playbackRate={playbackRate}
			preservePitch={preservePitch}
		/>
	);

	try {
		for (const sampleRate of [48000, 44100]) {
			for (const options of [
				{playbackRate: 1, parentRate: 1, preservePitch: undefined},
				{playbackRate: 1.4, parentRate: 1, preservePitch: undefined},
				{playbackRate: 1.4, parentRate: 1, preservePitch: false},
				{playbackRate: 0.5, parentRate: 1, preservePitch: true},
				{playbackRate: 1.4, parentRate: 1.5, preservePitch: true},
			]) {
				await verify(AudioComposition, sampleRate, options);
				await verify(VideoComposition, sampleRate, options);
			}
		}
	} finally {
		createBufferSourceSpy.mockRestore();
		URL.revokeObjectURL(src);
	}
});
