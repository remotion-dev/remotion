import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Freeze, Internals, Sequence, useCurrentFrame} from 'remotion';
import {expect, test, vi} from 'vitest';
import {Audio} from '../audio/audio';
import {Video} from '../video/video';

test('nested Sequence rates keep decoded video, looping, and scheduled audio in sync', async () => {
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

	const Composition: React.FC = () => {
		const frame = useCurrentFrame();
		const sourceFrame = 12 + (((frame - 14) * 0.75) % 48);
		return (
			<>
				<Sequence from={10} playbackRate={2}>
					<Sequence from={8} playbackRate={0.75}>
						<Video
							src="/bigbuckbunny.mp4"
							playbackRate={0.5}
							trimBefore={12}
							trimAfter={60}
							loop
							muted
							data-testid="nested-video"
							onVideoFrame={() => nestedDraws++}
						/>
						<Audio
							src="/bigbuckbunny.mp4"
							playbackRate={0.5}
							trimBefore={12}
							trimAfter={60}
							loop
						/>
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
				durationInFrames={150}
				fps={30}
				initialFrame={30}
				playbackRate={0.5}
				inputProps={{}}
			/>,
		);

		await expect.poll(() => nestedDraws).toBeGreaterThan(0);
		await expect.poll(() => referenceDraws).toBeGreaterThan(0);
		await expect
			.poll(() => createdNodes.filter((node) => node.buffer !== null).length)
			.toBeGreaterThan(0);
		for (const node of createdNodes.filter(
			(source) => source.buffer !== null,
		)) {
			expect(node.playbackRate.value).toBeCloseTo(0.375);
		}

		for (const frame of [30, 34, 94, 90]) {
			if (frame !== 30) {
				const previousNestedDraws = nestedDraws;
				const previousReferenceDraws = referenceDraws;
				playerRef.current!.seekTo(frame);
				await expect
					.poll(() => nestedDraws)
					.toBeGreaterThan(previousNestedDraws);
				await expect
					.poll(() => referenceDraws)
					.toBeGreaterThan(previousReferenceDraws);
			}

			const nested = container.querySelector<HTMLCanvasElement>(
				'[data-testid="nested-video"]',
			)!;
			const reference = container.querySelector<HTMLCanvasElement>(
				'[data-testid="reference-video"]',
			)!;
			expect(nested.width).toBeGreaterThan(0);
			// Decode both through the public component and compare the actual drawn pixels.
			expect(nested.toDataURL() === reference.toDataURL()).toBe(true);
		}
	} finally {
		root.unmount();
		container.remove();
		audioSpy.mockRestore();
	}
});

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
				.poll(
					() =>
						assets.length === 3 &&
						assets.every((asset) => asset.frame === frame),
				)
				.toBe(true);
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
