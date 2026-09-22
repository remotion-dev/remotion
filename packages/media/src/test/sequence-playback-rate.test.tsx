import {Player, type PlayerRef} from '@remotion/player';
import {
	AudioSample,
	AudioSampleSource,
	BufferTarget,
	CanvasSource,
	MkvOutputFormat,
	Output,
} from 'mediabunny';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Freeze, Internals, Sequence, useCurrentFrame} from 'remotion';
import {assert, expect, test, vi} from 'vitest';
import {Audio} from '../audio/audio';
import {Video} from '../video/video';

test('nested Sequence rates keep decoded video, looping, and scheduled audio in sync', async () => {
	const trimmedSrc = new URL(
		'../../../example/public/vp8-vorbis.webm',
		import.meta.url,
	).href;
	const createdNodes: AudioBufferSourceNode[] = [];
	const {createBufferSource} = AudioContext.prototype;
	const audioSpy = vi
		.spyOn(AudioContext.prototype, 'createBufferSource')
		.mockImplementation(function (this: AudioContext) {
			const node = createBufferSource.call(this);
			createdNodes.push(node);
			return node;
		});
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	let nestedDraws = 0;
	let referenceDraws = 0;
	let trimmedDraws = 0;
	let trimmedReferenceDraws = 0;

	const Composition: React.FC = () => {
		const frame = useCurrentFrame();
		const sourceFrame = 12 + (((frame - 18) * 1.3125) % 27);
		return (
			<>
				<Sequence from={10} playbackRate={2} trimBefore={12}>
					<Sequence from={8} playbackRate={0.75} trimBefore={3}>
						<Sequence from={6} playbackRate={1.25}>
							<Video
								src="/bigbuckbunny.mp4"
								playbackRate={0.7}
								from={15}
								durationInFrames={4000}
								trimBefore={12}
								trimAfter={39}
								loop
								muted
								data-testid="nested-video"
								onVideoFrame={() => nestedDraws++}
							/>
							<Audio
								src="/bigbuckbunny.mp4"
								playbackRate={0.7}
								from={15}
								durationInFrames={4000}
								trimBefore={12}
								trimAfter={39}
								loop
							/>
						</Sequence>
					</Sequence>
				</Sequence>
				<Freeze frame={sourceFrame}>
					<Video
						src="/bigbuckbunny.mp4"
						muted
						data-testid="reference-video"
						onVideoFrame={() => referenceDraws++}
					/>
				</Freeze>
				<Sequence
					from={30}
					trimBefore={75}
					playbackRate={2}
					durationInFrames={90}
				>
					<Video
						src={trimmedSrc}
						playbackRate={0.7}
						trimBefore={197}
						trimAfter={224}
						loop
						muted
						data-testid="trimmed-video"
						onVideoFrame={() => trimmedDraws++}
					/>
				</Sequence>
				{frame >= 30 && frame < 120 ? (
					<Freeze frame={197 + ((((frame - 30) * 2 + 75) * 0.7) % 27)}>
						<Video
							src={trimmedSrc}
							muted
							data-testid="trimmed-reference"
							onVideoFrame={() => trimmedReferenceDraws++}
						/>
					</Freeze>
				) : null}
			</>
		);
	};

	try {
		root.render(
			<Player
				ref={playerRef}
				acknowledgeRemotionLicense
				component={Composition}
				compositionHeight={720}
				compositionWidth={1280}
				durationInFrames={2100}
				fps={30}
				initialFrame={18}
				playbackRate={0.5}
				inputProps={{}}
			/>,
		);

		await expect.poll(() => nestedDraws, {timeout: 10_000}).toBeGreaterThan(0);
		await expect
			.poll(() => referenceDraws, {timeout: 10_000})
			.toBeGreaterThan(0);
		await expect
			.poll(() => createdNodes.filter((node) => node.buffer !== null).length, {
				timeout: 10_000,
			})
			.toBeGreaterThan(0);
		for (const node of createdNodes.filter(
			(source) => source.buffer !== null,
		)) {
			expect(node.playbackRate.value).toBeCloseTo(0.65625);
		}

		for (const frame of [
			18, 37, 38, 39, 50, 58, 59, 60, 78, 79, 80, 99, 100, 101, 1889, 1890,
			1891, 59, 38,
		]) {
			if (frame !== 18) {
				const previousNestedDraws = nestedDraws;
				const previousReferenceDraws = referenceDraws;
				const previousTrimmedDraws = trimmedDraws;
				const previousTrimmedReferenceDraws = trimmedReferenceDraws;
				playerRef.current!.seekTo(frame);
				await expect
					.poll(() => nestedDraws, {timeout: 10_000})
					.toBeGreaterThan(previousNestedDraws);
				await expect
					.poll(() => referenceDraws, {timeout: 10_000})
					.toBeGreaterThan(previousReferenceDraws);
				if (frame >= 30 && frame < 120) {
					await expect
						.poll(() => trimmedDraws, {timeout: 10_000})
						.toBeGreaterThan(previousTrimmedDraws);
					await expect
						.poll(() => trimmedReferenceDraws, {timeout: 10_000})
						.toBeGreaterThan(previousTrimmedReferenceDraws);
				}
			}

			const nested = container.querySelector<HTMLCanvasElement>(
				'[data-testid="nested-video"]',
			)!;
			const reference = container.querySelector<HTMLCanvasElement>(
				'[data-testid="reference-video"]',
			)!;
			expect(nested.width).toBeGreaterThan(0);
			// Decode both through the public component and compare the actual drawn pixels.
			expect(
				nested.toDataURL() === reference.toDataURL(),
				`nested video must match source frame at composition frame ${frame}`,
			).toBe(true);
			if (frame >= 30 && frame < 120) {
				const trimmed = container.querySelector<HTMLCanvasElement>(
					'[data-testid="trimmed-video"]',
				)!;
				const trimmedReference = container.querySelector<HTMLCanvasElement>(
					'[data-testid="trimmed-reference"]',
				)!;
				expect(
					trimmed.toDataURL() === trimmedReference.toDataURL(),
					`ancestor trim must match source frame at composition frame ${frame}`,
				).toBe(true);
			}
		}
	} finally {
		root.unmount();
		container.remove();
		audioSpy.mockRestore();
	}
}, 30_000);

test('client rendering resamples nested Sequence media at the combined rate', async () => {
	const environment = {
		isRendering: true,
		isClientSideRendering: true,
		isPlayer: false,
		isStudio: false,
		isReadOnlyStudio: false,
	};
	const originalAudioEnabled = window.remotion_audioEnabled;
	const originalVideoEnabled = window.remotion_videoEnabled;
	window.remotion_audioEnabled = true;
	window.remotion_videoEnabled = true;
	let assets: React.ContextType<
		typeof Internals.RenderAssetManager
	>['renderAssets'] = [];
	const ObserveRenderedAssets: React.FC = () => {
		assets = React.useContext(Internals.RenderAssetManager).renderAssets;
		return null;
	};

	const Composition: React.FC = () => (
		<Internals.RemotionEnvironmentContext.Provider value={environment}>
			<Internals.RenderAssetManagerProvider collectAssets={null}>
				<Sequence from={10} playbackRate={2} trimBefore={24}>
					<Sequence from={12} playbackRate={0.75}>
						<Audio src="/bigbuckbunny.mp4" playbackRate={0.5} trimBefore={15} />
						<Video
							src="/bigbuckbunny.mp4"
							playbackRate={0.5}
							trimBefore={15}
							data-testid="rendered-nested"
						/>
					</Sequence>
				</Sequence>
				<Audio
					src="/bigbuckbunny.mp4"
					from={4}
					playbackRate={0.75}
					trimBefore={15}
				/>
				<Video
					src="/bigbuckbunny.mp4"
					from={4}
					playbackRate={0.75}
					trimBefore={15}
					muted
					data-testid="rendered-reference"
				/>
				<ObserveRenderedAssets />
			</Internals.RenderAssetManagerProvider>
		</Internals.RemotionEnvironmentContext.Provider>
	);
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	try {
		root.render(
			<Player
				ref={playerRef}
				acknowledgeRemotionLicense
				component={Composition}
				compositionHeight={720}
				compositionWidth={1280}
				durationInFrames={150}
				fps={30}
				sampleRate={48000}
				initialFrame={25}
				inputProps={{}}
			/>,
		);
		for (const frame of [25, 26]) {
			if (frame !== 25) {
				playerRef.current!.seekTo(frame);
			}

			await expect
				.poll(() => assets.map((asset) => asset.frame), {timeout: 5000})
				.toEqual([frame, frame, frame]);
			const audioAssets = assets.filter(
				(asset) => asset.type === 'inline-audio',
			);
			expect(audioAssets).toHaveLength(3);
			for (const asset of audioAssets) {
				// Codec sample boundaries may add one stereo sample when resampling.
				expect(Math.abs(asset.audio.length - 3200)).toBeLessThanOrEqual(2);
				expect(
					Math.abs(
						asset.timestamp - (1.025 + (frame - 25) * 0.025) * 1_000_000,
					),
				).toBeLessThanOrEqual(25);
				expect(asset.audio).toEqual(audioAssets[0].audio);
				expect(asset.audio.some((sample) => sample !== 0)).toBe(true);
			}

			const nested = container.querySelector<HTMLCanvasElement>(
				'[data-testid="rendered-nested"]',
			)!;
			const reference = container.querySelector<HTMLCanvasElement>(
				'[data-testid="rendered-reference"]',
			)!;
			await expect
				.poll(
					() =>
						nested.width > 0 && nested.toDataURL() === reference.toDataURL(),
				)
				.toBe(true);
		}
	} finally {
		root.unmount();
		container.remove();
		window.remotion_audioEnabled = originalAudioEnabled;
		window.remotion_videoEnabled = originalVideoEnabled;
	}
});

test('client rendering wraps embedded video audio and preserves silent tails at fractional loop boundaries', async () => {
	// The audio ends 10ms before the trimmed loop, while the video continues.
	// Looping must preserve that silence before restarting the positive PCM.
	const sourceSampleRate = 48000;
	const pcm = new Int16Array(61920);
	pcm.fill(-8000);
	pcm.fill(8000, 19200);
	const target = new BufferTarget();
	const output = new Output({format: new MkvOutputFormat(), target});
	const canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = 32;
	canvas.getContext('2d')!.fillRect(0, 0, 32, 32);
	const videoSource = new CanvasSource(canvas, {codec: 'vp8', bitrate: 100000});
	const audioSource = new AudioSampleSource({codec: 'pcm-s16'});
	output.addVideoTrack(videoSource);
	output.addAudioTrack(audioSource);
	await output.start();
	await videoSource.add(0, 3);
	const audioSample = new AudioSample({
		data: pcm,
		format: 's16',
		sampleRate: sourceSampleRate,
		numberOfChannels: 1,
		timestamp: 0,
	});
	await audioSource.add(audioSample);
	audioSample.close();
	await output.finalize();
	const src = URL.createObjectURL(
		new Blob([target.buffer!], {type: 'video/x-matroska'}),
	);

	const environment = {
		isRendering: true,
		isClientSideRendering: true,
		isPlayer: false,
		isStudio: false,
		isReadOnlyStudio: false,
	};
	const originalAudioEnabled = window.remotion_audioEnabled;
	window.remotion_audioEnabled = true;
	let assets: React.ContextType<
		typeof Internals.RenderAssetManager
	>['renderAssets'] = [];
	const ObserveRenderedAssets: React.FC = () => {
		assets = React.useContext(Internals.RenderAssetManager).renderAssets;
		return null;
	};

	const Composition: React.FC = () => (
		<Internals.RemotionEnvironmentContext.Provider value={environment}>
			<Internals.RenderAssetManagerProvider collectAssets={null}>
				<Sequence from={10} playbackRate={2} trimBefore={12}>
					<Sequence from={8} playbackRate={0.75} trimBefore={3}>
						<Sequence from={6} playbackRate={1.25}>
							<Audio
								src={src}
								from={15}
								durationInFrames={180}
								playbackRate={0.7}
								volume={(frame) => 0.5 + frame / 200}
								trimBefore={12}
								trimAfter={39}
								loop
							/>
							<Video
								src={src}
								from={15}
								durationInFrames={180}
								playbackRate={0.7}
								volume={(frame) => 0.5 + frame / 200}
								trimBefore={12}
								trimAfter={39}
								loop
							/>
						</Sequence>
					</Sequence>
				</Sequence>
				<Audio
					src={src}
					from={18}
					durationInFrames={96}
					playbackRate={1.3125}
					volume={(frame) => 0.5 + (frame * 1.875) / 200}
					trimBefore={12}
					trimAfter={39}
					loop
				/>
				<ObserveRenderedAssets />
			</Internals.RenderAssetManagerProvider>
		</Internals.RemotionEnvironmentContext.Provider>
	);
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	try {
		root.render(
			<Player
				ref={playerRef}
				acknowledgeRemotionLicense
				component={Composition}
				compositionHeight={720}
				compositionWidth={1280}
				durationInFrames={150}
				fps={30}
				sampleRate={48000}
				initialFrame={18}
				inputProps={{}}
			/>,
		);
		for (const frame of [
			18, 37, 38, 39, 58, 59, 60, 78, 79, 80, 99, 100, 101, 59, 38,
		]) {
			if (frame !== 18) {
				playerRef.current!.seekTo(frame);
			}

			await expect
				.poll(() => assets.map((asset) => asset.frame), {
					timeout: 5000,
					message: `render assets at frame ${frame}`,
				})
				.toEqual([frame, frame, frame]);
			const audioAssets = assets.filter(
				(asset) => asset.type === 'inline-audio',
			);
			expect(audioAssets).toHaveLength(3);
			for (const asset of audioAssets) {
				expect(Math.abs(asset.audio.length - 3200)).toBeLessThanOrEqual(2);
				expect(
					asset.audio.every((sample) => sample >= 0 && sample <= 8000),
					`audio must stay within trim at frame ${frame}`,
				).toBe(true);
				const volumeFrame = ((frame - 18) * 1.875) % (27 / 0.7);
				const amplitude = Math.trunc(8000 * (0.5 + volumeFrame / 200));
				for (let i = 0; i < asset.audio.length; i++) {
					expect(
						Math.abs(asset.audio[i] - audioAssets[0].audio[i]),
					).toBeLessThanOrEqual(1);
				}

				for (let sample = 0; sample < asset.audio.length / 2; sample++) {
					const sourceSample =
						19200 + (((frame - 18) * 2100 + sample * 1.3125) % 43200);
					// Only samples immediately on a resampling boundary can blend with silence.
					if (Math.abs(sourceSample - 61920) > 2 && 62400 - sourceSample > 2) {
						expect(
							asset.audio[sample * 2],
							`PCM timing at composition frame ${frame}, sample ${sample}`,
						).toBeCloseTo(sourceSample >= 61920 ? 0 : amplitude, -1);
					}
				}
			}
		}
	} finally {
		root.unmount();
		container.remove();
		URL.revokeObjectURL(src);
		window.remotion_audioEnabled = originalAudioEnabled;
	}
});

test('trimmed loop volume matches live playback and complete Studio curves for repeat and extend', async () => {
	const environment = {
		isRendering: false,
		isClientSideRendering: false,
		isPlayer: false,
		isStudio: true,
		isReadOnlyStudio: false,
	};
	let sequences: React.ContextType<
		typeof Internals.SequenceManager
	>['sequences'] = [];
	const observedFrames = {repeat: -1, extend: -1};
	const repeatVolume = (frame: number) => {
		observedFrames.repeat = frame;
		return 0.25 + frame / 200;
	};

	const extendVolume = (frame: number) => {
		observedFrames.extend = frame;
		return 0.25 + frame / 200;
	};

	const ObserveSequences: React.FC = () => {
		sequences = React.useContext(Internals.SequenceManager).sequences;
		return null;
	};

	let videoDraws = 0;
	const Composition: React.FC = () => (
		<Internals.RemotionEnvironmentContext.Provider value={environment}>
			<Internals.SequenceManagerProvider>
				<Internals.SequenceRegistrationContext.Provider value>
					<Sequence
						from={10}
						playbackRate={2}
						trimBefore={75}
						durationInFrames={60}
					>
						<Audio
							src="/bigbuckbunny.mp4"
							from={5}
							durationInFrames={130}
							trimBefore={12}
							trimAfter={39}
							playbackRate={0.7}
							loop
							name="repeat audio"
							volume={repeatVolume}
						/>
						<Video
							src="/bigbuckbunny.mp4"
							from={5}
							durationInFrames={130}
							trimBefore={12}
							trimAfter={39}
							playbackRate={0.7}
							loop
							name="extend video"
							volume={extendVolume}
							loopVolumeCurveBehavior="extend"
							muted
							onVideoFrame={() => videoDraws++}
						/>
					</Sequence>
					<ObserveSequences />
				</Internals.SequenceRegistrationContext.Provider>
			</Internals.SequenceManagerProvider>
		</Internals.RemotionEnvironmentContext.Provider>
	);
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	try {
		root.render(
			<Player
				ref={playerRef}
				acknowledgeRemotionLicense
				component={Composition}
				compositionHeight={720}
				compositionWidth={1280}
				durationInFrames={150}
				fps={30}
				initialFrame={10}
				inputProps={{}}
			/>,
		);
		await expect.poll(() => videoDraws).toBeGreaterThan(0);
		await expect
			.poll(
				() =>
					sequences.filter(
						(sequence) =>
							sequence.type === 'audio' || sequence.type === 'video',
					).length,
			)
			.toBe(2);
		for (const behavior of ['repeat', 'extend'] as const) {
			const sequence = sequences.find(
				(item) =>
					item.displayName ===
					`${behavior} ${behavior === 'repeat' ? 'audio' : 'video'}`,
			)!;
			assert(sequence.type === 'audio' || sequence.type === 'video');
			expect(typeof sequence.volume).toBe('string');
			const curve = (sequence.volume as string).split(',').map(Number);
			expect(curve).toHaveLength(30);
			for (let i = 0; i < curve.length; i++) {
				const frame =
					behavior === 'extend'
						? i * 2
						: Math.min(i * 2, (70 + i * 2) % (27 / 0.7));
				expect(curve[i]).toBeCloseTo(0.25 + frame / 200);
			}
		}

		for (const frame of [11, 13, 14, 20, 33, 38, 14]) {
			const previousDraws = videoDraws;
			playerRef.current!.seekTo(frame);
			await expect.poll(() => videoDraws).toBeGreaterThan(previousDraws);
			expect(observedFrames.extend).toBeCloseTo((frame - 10) * 2);
			expect(observedFrames.repeat).toBeCloseTo(
				Math.min((frame - 10) * 2, (70 + (frame - 10) * 2) % (27 / 0.7)),
			);
		}
	} finally {
		root.unmount();
		container.remove();
	}
});
