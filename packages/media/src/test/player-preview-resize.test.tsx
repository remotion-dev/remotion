import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
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
		const onFrame = (frame: CanvasImageSource) => {
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
		const render = (size: MaxCanvasSinkFrameSize | null) =>
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
		try {
			render({width: 256});
			await waitFor(() => frames.length > 0 && playerRef.current !== null);
			playerRef.current!.addEventListener('waiting', () => waiting++);
			playerRef.current!.play();
			await waitFor(() => frames.length > 10);
			const initialDisposals = dispose.mock.calls.length;
			waiting = 0;
			const sizes = [
				{size: {width: 512}, width: 512, height: 288},
				{size: {height: 144}, width: 256, height: 144},
				{size: {width: 1280}, width: 1280, height: 720},
				{size: null, width: 1920, height: 1080},
			];
			for (const paused of [false, true]) {
				if (paused) playerRef.current!.pause();
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

			expect(waiting).toBe(0);
		} finally {
			root.unmount();
			dispose.mockRestore();
			container.remove();
			URL.revokeObjectURL(src);
		}
	},
);
