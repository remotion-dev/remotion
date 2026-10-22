import {Player, type PlayerRef} from '@remotion/player';
import React, {useContext} from 'react';
import {createRoot} from 'react-dom/client';
import {Internals, useBufferState} from 'remotion';
import {expect, test, vi} from 'vitest';
import {Video} from '../video/video';
import {findLargestCanvas, waitFor} from './player-frame-accuracy-utils';

test('Player distinguishes playback catch-up while buffering from explicit seeks', async () => {
	let timeline: React.ContextType<typeof Internals.SetTimelineContext> | null =
		null;
	let bufferState: ReturnType<typeof useBufferState> | null = null;
	let draws = 0;
	const errors: Error[] = [];
	const Composition = () => {
		timeline = useContext(Internals.SetTimelineContext);
		bufferState = useBufferState();
		return (
			<Video
				src="/bigbuckbunny.mp4"
				muted
				onVideoFrame={() => {
					draws++;
				}}
				onError={(error) => {
					errors.push(error);
				}}
			/>
		);
	};

	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const ref = React.createRef<PlayerRef>();
	const configurations = vi.spyOn(VideoDecoder.prototype, 'configure');
	let foreignBuffer: {unblock: () => void} | null = null;
	root.render(
		<Player
			ref={ref}
			component={Composition}
			compositionWidth={320}
			compositionHeight={180}
			durationInFrames={300}
			fps={30}
			numberOfSharedAudioTags={0}
		/>,
	);
	try {
		await waitFor(() => draws > 0 && !timeline!.isBuffering());
		// Establish the correct output through a public paused seek.
		let before = draws;
		ref.current!.seekTo(60);
		await waitFor(() => draws > before && !timeline!.isBuffering());
		const target = findLargestCanvas(container).toDataURL();
		before = draws;
		ref.current!.seekTo(0);
		await waitFor(() => draws > before && !timeline!.isBuffering());
		expect(findLargestCanvas(container).toDataURL()).not.toBe(target);

		// A forward jump while playback is running is navigation, not catch-up.
		ref.current!.play();
		await waitFor(() => ref.current!.isPlaying() && !timeline!.isBuffering());
		const revisionBeforeForwardSeek = timeline!.seek!.revision.current;
		const configuredBeforeForwardSeek = configurations.mock.calls.length;
		before = draws;
		ref.current!.seekTo(240);
		await waitFor(
			() =>
				draws > before &&
				ref.current!.getCurrentFrame() >= 240 &&
				!timeline!.isBuffering(),
		);
		expect(timeline!.seek!.revision.current).toBe(
			revisionBeforeForwardSeek + 1,
		);
		expect(configurations.mock.calls.length).toBeGreaterThan(
			configuredBeforeForwardSeek,
		);
		expect(findLargestCanvas(container).toDataURL()).not.toBe(target);
		before = draws;
		ref.current!.seekTo(0);
		await waitFor(() => draws > before && !timeline!.isBuffering());

		// Another layer blocks the clock. A missed playback update still must
		// consume the existing iterator, not guess intent from the time gap.
		foreignBuffer = bufferState!.delayPlayback();
		await waitFor(() => ref.current!.isPlaying() && timeline!.isBuffering());
		const configuredBeforeCatchup = configurations.mock.calls.length;
		const revision = timeline!.seek!.revision.current;
		before = draws;
		timeline!.setFrameWithoutSeek((frames) => ({
			...frames,
			[Object.keys(frames)[0]]: 60,
		}));
		await waitFor(
			() =>
				draws > before && findLargestCanvas(container).toDataURL() === target,
		);
		expect(ref.current!.getCurrentFrame()).toBe(60);
		expect(timeline!.seek!.revision.current).toBe(revision);
		expect(configurations.mock.calls.length).toBe(configuredBeforeCatchup);

		// The same playing/buffering state, but now a deliberate distant seek.
		before = draws;
		ref.current!.seekTo(240);
		await waitFor(
			() => draws > before && ref.current!.getCurrentFrame() === 240,
		);
		expect(configurations.mock.calls.length).toBeGreaterThan(
			configuredBeforeCatchup,
		);
		expect(findLargestCanvas(container).toDataURL()).not.toBe(target);

		before = draws;
		ref.current!.seekTo(120);
		ref.current!.seekTo(15);
		ref.current!.seekTo(60);
		ref.current!.pause();
		foreignBuffer.unblock();
		foreignBuffer = null;
		await waitFor(
			() =>
				draws > before &&
				!timeline!.isBuffering() &&
				findLargestCanvas(container).toDataURL() === target,
		);
		expect(ref.current!.getCurrentFrame()).toBe(60);
		expect(errors).toEqual([]);
	} finally {
		foreignBuffer?.unblock();
		root.unmount();
		container.remove();
		configurations.mockRestore();
	}
}, 30000);
