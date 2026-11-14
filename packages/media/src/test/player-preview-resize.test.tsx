import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {createEffect, Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {MediaPlayer} from '../media-player';
import type {MaxCanvasSinkFrameSize} from '../video/props';
import {Video} from '../video/video';
import {waitFor} from './player-frame-accuracy-utils';

test.each([false, true])(
	'resizes playing and paused video without replacing the media player (Studio: %s)',
	async (isStudio) => {
		const response = await fetch('/video.mp4');
		const src = URL.createObjectURL(await response.blob());
		const dispose = vi.spyOn(MediaPlayer.prototype, 'dispose');
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		const playerRef = React.createRef<PlayerRef>();
		const frames: {width: number; height: number}[] = [];
		let waiting = 0;
		let phase = 'initial playback';
		let requestedSize: MaxCanvasSinkFrameSize | null = null;
		let resizeStartedAt = performance.now();
		let lastFrameAt: number | null = null;
		const waitingEvents: {
			phase: string;
			requestedSize: MaxCanvasSinkFrameSize | null;
			frame: number | null;
			disposals: number;
			lastFrameSize: {width: number; height: number} | null;
			millisecondsSinceFrame: number | null;
			millisecondsSinceResize: number;
		}[] = [];
		const onFrame = (frame: CanvasImageSource) => {
			lastFrameAt = performance.now();
			const canvas = frame as OffscreenCanvas;
			frames.push({
				width: canvas.width,
				height: canvas.height,
			});
		};

		const environment = {
			isRendering: false,
			isClientSideRendering: false,
			isPlayer: !isStudio,
			isStudio,
			isReadOnlyStudio: false,
		};
		const Composition = ({
			size,
		}: {
			readonly size: MaxCanvasSinkFrameSize | null;
		}) => (
			<Internals.RemotionEnvironmentContext.Provider value={environment}>
				<Internals.SequenceManagerProvider>
					<Internals.SequenceRegistrationContext.Provider value>
						<Video
							src={src}
							maxCanvasSinkFrameSize={size}
							onVideoFrame={onFrame}
							disallowFallbackToOffthreadVideo
						/>
					</Internals.SequenceRegistrationContext.Provider>
				</Internals.SequenceManagerProvider>
			</Internals.RemotionEnvironmentContext.Provider>
		);
		const render = (size: MaxCanvasSinkFrameSize | null) => {
			requestedSize = size;
			resizeStartedAt = performance.now();
			flushSync(() =>
				root.render(
					<Player
						ref={playerRef}
						component={Composition}
						inputProps={{size}}
						compositionWidth={1920}
						compositionHeight={1080}
						durationInFrames={300}
						fps={30}
						initiallyMuted
						acknowledgeRemotionLicense
						style={{width: 640}}
					/>,
				),
			);
		};

		try {
			render({width: 256});
			await waitFor(() => frames.length > 0 && playerRef.current !== null);
			playerRef.current!.addEventListener('waiting', () => {
				waiting++;
				const now = performance.now();
				waitingEvents.push({
					phase,
					requestedSize,
					frame: playerRef.current?.getCurrentFrame() ?? null,
					disposals: dispose.mock.calls.length,
					lastFrameSize: frames.at(-1) ?? null,
					millisecondsSinceFrame:
						lastFrameAt === null ? null : now - lastFrameAt,
					millisecondsSinceResize: now - resizeStartedAt,
				});
			});
			playerRef.current!.play();
			await waitFor(() => frames.length > 10);
			const initialDisposals = dispose.mock.calls.length;
			waiting = 0;
			waitingEvents.length = 0;
			const sizes = [
				{size: {width: 512}, width: 512, height: 288},
				{size: {height: 144}, width: 256, height: 144},
				{size: {width: 1280}, width: 1280, height: 720},
				{size: null, width: 1920, height: 1080},
			];
			for (const paused of [false, true]) {
				phase = paused ? 'pausing before resize' : 'playing resize';
				if (paused) flushSync(() => playerRef.current!.pause());
				if (paused) phase = 'paused resize';
				const frame = playerRef.current!.getCurrentFrame();
				for (const size of sizes) {
					const count = frames.length;
					render(size.size);
					await waitFor(
						() =>
							frames.length > count &&
							frames.at(-1)!.width === size.width &&
							frames.at(-1)!.height === size.height,
					);
					if (paused) expect(playerRef.current!.getCurrentFrame()).toBe(frame);
				}

				expect(dispose.mock.calls.length).toBe(initialDisposals);
			}

			expect(waiting, JSON.stringify(waitingEvents)).toBe(0);
		} catch (error) {
			if (waiting === 0 || !playerRef.current) throw error;
			const resizeWaiting = [...waitingEvents];
			const control: {events: typeof waitingEvents; error: string | null} = {
				events: [],
				error: null,
			};
			try {
				phase = 'stable-size control startup';
				const beforeControl = frames.length;
				flushSync(() => {
					playerRef.current!.pause();
					playerRef.current!.seekTo(0);
				});
				render({width: 256});
				await waitFor(() => frames.length > beforeControl);
				const warmup = frames.length;
				playerRef.current!.play();
				await waitFor(() => frames.length >= warmup + 10);
				waitingEvents.length = 0;
				phase = 'stable-size control';
				await waitFor(() => playerRef.current!.getCurrentFrame() >= 45);
				control.events = [...waitingEvents];
			} catch (controlError) {
				control.error =
					controlError instanceof Error
						? controlError.message
						: String(controlError);
			}

			if (error instanceof Error) {
				error.message += `\nResize failure and stable-size control: ${JSON.stringify({isStudio, resizeWaiting, control})}`;
			}

			throw error;
		} finally {
			root.unmount();
			dispose.mockRestore();
			container.remove();
			URL.revokeObjectURL(src);
		}
	},
);

test('keeps a paused resize that arrives while the replacement frame is painting effects', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const ref = React.createRef<PlayerRef>();
	let draws = 0;
	let blockNextBitmap = false;
	let bitmapBlocked = false;
	let releaseBitmap!: () => void;
	const gate = new Promise<void>((resolve) => {
		releaseBitmap = resolve;
	});
	const nativeCreateImageBitmap = globalThis.createImageBitmap;
	const bitmapSpy = vi
		.spyOn(globalThis, 'createImageBitmap')
		.mockImplementation(async (...args) => {
			const bitmap: ImageBitmap = await Reflect.apply(
				nativeCreateImageBitmap,
				globalThis,
				args,
			);
			if (blockNextBitmap) {
				blockNextBitmap = false;
				bitmapBlocked = true;
				await gate;
			}

			return bitmap;
		});
	const effect = createEffect<{refresh: number}, null>({
		type: 'resize-during-effects',
		label: 'Resize during effects',
		backend: '2d',
		documentationLink: null,
		schema: {},
		calculateKey: ({refresh}) => String(refresh),
		validateParams() {},
		setup: () => null,
		cleanup() {},
		apply: ({source, target, width, height}) => {
			target.getContext('2d')!.drawImage(source, 0, 0, width, height);
		},
	});
	const Composition = ({
		width,
		refresh,
	}: {
		readonly width: number;
		readonly refresh: number;
	}) => {
		const effects = React.useMemo(() => [effect({refresh})], [refresh]);
		return (
			<Video
				src="/video.mp4"
				muted
				maxCanvasSinkFrameSize={{width}}
				effects={effects}
				effectsOutputSize={{width: 160, height: 90}}
				onVideoFrame={() => draws++}
				disallowFallbackToOffthreadVideo
			/>
		);
	};

	const render = (width: number, refresh = 0) =>
		flushSync(() =>
			root.render(
				<Player
					ref={ref}
					component={Composition}
					inputProps={{width, refresh}}
					compositionWidth={1920}
					compositionHeight={1080}
					durationInFrames={300}
					fps={30}
					initialFrame={45}
					initiallyMuted
					acknowledgeRemotionLicense
					style={{width: 640}}
				/>,
			),
		);
	const pixels = () =>
		container
			.querySelector('canvas')!
			.getContext('2d')!
			.getImageData(0, 0, 1920, 1080).data;
	try {
		render(64);
		await waitFor(() => draws > 0 && ref.current !== null);
		const beforeSeek = draws;
		blockNextBitmap = true;
		flushSync(() => ref.current!.seekTo(15));
		await waitFor(() => bitmapBlocked);
		render(1920);
		releaseBitmap();
		await waitFor(() => draws >= beforeSeek + 2);
		const resized = pixels();
		const beforeRefresh = draws;
		render(1920, 1);
		await waitFor(() => draws > beforeRefresh);
		const reference = pixels();
		const differences = reference.reduce(
			(sum, value, index) => sum + (value !== resized[index] ? 1 : 0),
			0,
		);
		expect(differences).toBe(0);
		expect(ref.current!.getCurrentFrame()).toBe(15);
	} finally {
		releaseBitmap();
		root.unmount();
		bitmapSpy.mockRestore();
		container.remove();
	}
});
