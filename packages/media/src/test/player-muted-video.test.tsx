import {Player, type PlayerRef} from '@remotion/player';
import React, {useContext} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals, Sequence} from 'remotion';
import {expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
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

const VideoComposition: React.FC = () => {
	return <Video src="/bigbuckbunny.mp4" disallowFallbackToOffthreadVideo />;
};

test('renders an initially muted video and resumes audio after reverse playback', async () => {
	// Call through to Web Audio so invalid start offsets still throw.
	const starts = vi.spyOn(AudioBufferSourceNode.prototype, 'start');
	const startedMediaNodes = () =>
		(starts.mock.contexts as AudioBufferSourceNode[]).filter(
			(node) => node.buffer !== null,
		);
	const container = document.createElement('div');
	document.body.appendChild(container);
	const playerRef = React.createRef<PlayerRef>();
	const root = createRoot(container);
	const renderPlayer = (playbackRate: number) => {
		flushSync(() => {
			root.render(
				<Player
					ref={playerRef}
					acknowledgeRemotionLicense
					component={VideoComposition}
					compositionHeight={720}
					compositionWidth={1280}
					controls
					durationInFrames={300}
					fps={30}
					initiallyMuted
					playbackRate={playbackRate}
					inputProps={{}}
				/>,
			);
		});
	};

	try {
		renderPlayer(1);
		await waitFor(() => {
			const renderedCanvas = container.querySelector('canvas');
			return renderedCanvas?.width === 1280 && renderedCanvas.height === 720;
		});

		const canvas = container.querySelector('canvas');
		expect(canvas?.width).toBe(1280);
		expect(canvas?.height).toBe(720);

		flushSync(() => {
			playerRef.current!.seekTo(60);
			playerRef.current!.unmute();
		});
		await page.getByRole('button', {name: 'Play video'}).click();
		await waitFor(
			() =>
				startedMediaNodes().length > 0 &&
				playerRef.current!.getCurrentFrame() > 60,
		);

		const forwardFrame = playerRef.current!.getCurrentFrame();
		// J changes the Player's global rate while playback continues.
		renderPlayer(-1);
		await waitFor(
			() => playerRef.current!.getCurrentFrame() < forwardFrame - 2,
		);
		// Changing the prop updates the global rate in a passive effect. Begin
		// observing silence only after the Player has entered reverse playback.
		starts.mockClear();
		const reversingFrame = playerRef.current!.getCurrentFrame();
		await waitFor(
			() => playerRef.current!.getCurrentFrame() < reversingFrame - 2,
		);
		expect(startedMediaNodes()).toHaveLength(0);

		const reverseFrame = playerRef.current!.getCurrentFrame();
		renderPlayer(1);
		await waitFor(
			() =>
				startedMediaNodes().length > 0 &&
				playerRef.current!.getCurrentFrame() > reverseFrame,
		);
	} finally {
		root.unmount();
		container.remove();
		starts.mockRestore();
	}
}, 15000);

test('renders a negatively offset video inside a sequence', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const NestedVideoComposition: React.FC = () => {
		return (
			<Sequence from={175} durationInFrames={150}>
				<Video
					data-testid="negatively-offset-video"
					from={-151}
					src="/bigbuckbunny.mp4"
				/>
			</Sequence>
		);
	};

	const root = createRoot(container);
	root.render(
		<Player
			acknowledgeRemotionLicense
			component={NestedVideoComposition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={325}
			fps={30}
			initialFrame={175}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(() => {
			const renderedCanvas = container.querySelector(
				'[data-testid="negatively-offset-video"]',
			);
			return renderedCanvas instanceof HTMLCanvasElement;
		});
	} finally {
		root.unmount();
		container.remove();
	}
});

test('plays while a video with audio is frozen on a future frame', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const playerRef = React.createRef<PlayerRef>();

	const timeline =
		React.createRef<React.ContextType<typeof Internals.SetTimelineContext>>();
	let draws = 0;
	const errors: Error[] = [];
	let phase = 'waiting for the frozen video to be ready';

	const FrozenVideoComposition: React.FC = () => {
		timeline.current = useContext(Internals.SetTimelineContext);
		return (
			<Sequence freeze={150}>
				<Video
					src="/bigbuckbunny.mp4"
					disallowFallbackToOffthreadVideo
					onVideoFrame={() => {
						draws++;
					}}
					onError={(error) => {
						errors.push(error);
					}}
				/>
			</Sequence>
		);
	};

	const root = createRoot(container);
	root.render(
		<Player
			ref={playerRef}
			acknowledgeRemotionLicense
			component={FrozenVideoComposition}
			compositionHeight={720}
			compositionWidth={1280}
			controls
			durationInFrames={300}
			fps={30}
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(
			() =>
				playerRef.current !== null &&
				draws > 0 &&
				timeline.current?.isBuffering() === false,
		);

		phase = 'clicking Play';
		await page.getByRole('button', {name: 'Play video'}).click();
		phase = 'waiting for the Player frame to advance';
		await waitFor(() => (playerRef.current?.getCurrentFrame() ?? 0) > 0);

		expect(playerRef.current?.getCurrentFrame()).toBeGreaterThan(0);
	} catch (cause) {
		throw new Error(
			`Failed while ${phase}: ${JSON.stringify({
				isPlaying: playerRef.current?.isPlaying() ?? null,
				isBuffering: timeline.current?.isBuffering() ?? null,
				frame: playerRef.current?.getCurrentFrame() ?? null,
				draws,
				mediaErrors: errors.map((error) => error.message),
			})}`,
			{cause},
		);
	} finally {
		root.unmount();
		container.remove();
	}
});
