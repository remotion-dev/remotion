import {Player, type PlayerRef} from '@remotion/player';
import {CanvasSink} from 'mediabunny';
import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {Audio} from '../audio/audio';
import {MediaPlayer} from '../media-player';
import {Video} from '../video/video';

const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (Date.now() - started < 10000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error('Timed out waiting for condition');
};

test('surfaces a read failure during overlapping video playback seeks', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	const error = new TypeError('Video read failed during playback');
	const onError = vi.fn(() => 'fail' as const);
	const onVideoFrame = vi.fn();
	let rejectRead!: (error: Error) => void;
	const {canvases} = CanvasSink.prototype;
	const readSpy = vi
		.spyOn(CanvasSink.prototype, 'canvases')
		.mockImplementation(async function* (this: CanvasSink, ...args) {
			const iterator = canvases.apply(this, args);
			try {
				const first = await iterator.next();
				if (first.done) {
					return;
				}

				yield first.value;
				// Keep the next real media read pending while playback advances.
				await new Promise<void>((_, reject) => {
					rejectRead = reject;
				});
			} finally {
				await iterator.return();
			}
		});
	const Composition = () => (
		<Video
			src="/bigbuckbunny.mp4"
			onError={onError}
			onVideoFrame={onVideoFrame}
		/>
	);
	root.render(
		<Player
			ref={playerRef}
			acknowledgeRemotionLicense
			component={Composition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={100}
			fps={30}
			initiallyMuted
			inputProps={{}}
			errorFallback={({error: caught}) => <div>{caught.message}</div>}
		/>,
	);
	try {
		await vi.waitFor(() => expect(onVideoFrame).toHaveBeenCalled());
		await vi.waitFor(() => expect(rejectRead).toBeDefined());
		playerRef.current!.play();
		// Several frame updates supersede the seek awaiting the failed read,
		// but the queued seeks still depend on the same video iterator.
		await waitFor(() => playerRef.current!.getCurrentFrame() >= 3);
		rejectRead(error);
		await vi.waitFor(() =>
			expect(container.textContent).toContain(error.message),
		);
		expect(onError).toHaveBeenCalledExactlyOnceWith(error);
	} finally {
		rejectRead?.(error);
		root.unmount();
		container.remove();
		readSpy.mockRestore();
	}
});

test.each([
	['audio', 'callback'],
	['video', 'callback'],
	['audio', 'disallow'],
	['video', 'disallow'],
] as const)(
	'surfaces terminal %s failures with %s policy through the preview error boundary',
	async (tagType, policy) => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		let player: MediaPlayer | null = null;
		const {initialize} = MediaPlayer.prototype;
		const initSpy = vi
			.spyOn(MediaPlayer.prototype, 'initialize')
			.mockImplementation(function (this: MediaPlayer, ...args) {
				return initialize.apply(this, args).then((result) => {
					if (result.type === 'success') {
						player = this;
					}

					return result;
				});
			});
		const error = new Error('Terminal preview read failure');
		const Composition = () =>
			tagType === 'audio' ? (
				<Audio
					src="/voice-note.m4a"
					onError={policy === 'callback' ? () => 'fail' : undefined}
					disallowFallbackToHtml5Audio={policy === 'disallow'}
				/>
			) : (
				<Video
					src="/bigbuckbunny.mp4"
					onError={policy === 'callback' ? () => 'fail' : undefined}
					disallowFallbackToOffthreadVideo={policy === 'disallow'}
				/>
			);
		root.render(
			<Player
				acknowledgeRemotionLicense
				component={Composition}
				compositionHeight={720}
				compositionWidth={1280}
				durationInFrames={100}
				fps={30}
				inputProps={{}}
				errorFallback={({error: caught}) => <div>{caught.message}</div>}
			/>,
		);
		try {
			await waitFor(() => player !== null);
			// Exercise the callback owned by the preview, not the seek catch.
			// eslint-disable-next-line dot-notation
			player!['reportTerminalError'](error);
			await waitFor(
				() => container.textContent?.includes(error.message) === true,
			);
		} finally {
			root.unmount();
			container.remove();
			initSpy.mockRestore();
		}
	},
);

test('does not reinitialize MediaPlayer when onError identity changes', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const initSpy = vi.spyOn(MediaPlayer.prototype, 'initialize');
	const root = createRoot(container);
	let committedRerenders = 0;

	const VideoComposition: React.FC = () => {
		const [rerenders, setRerenders] = useState(0);

		useEffect(() => {
			const interval = window.setInterval(() => {
				setRerenders((current) => {
					if (current >= 4) {
						window.clearInterval(interval);
						return current;
					}

					return current + 1;
				});
			}, 50);

			return () => window.clearInterval(interval);
		}, []);

		useEffect(() => {
			committedRerenders = rerenders;
		}, [rerenders]);

		return <Video src="/bigbuckbunny.mp4" onError={() => {}} />;
	};

	root.render(
		<Player
			acknowledgeRemotionLicense
			component={VideoComposition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={100}
			fps={30}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(() => {
			const renderedCanvas = container.querySelector('canvas');
			return (
				renderedCanvas?.width === 1280 &&
				renderedCanvas.height === 720 &&
				committedRerenders >= 4
			);
		});

		expect(initSpy.mock.calls.length).toBe(1);
	} finally {
		root.unmount();
		container.remove();
		initSpy.mockRestore();
	}
});
