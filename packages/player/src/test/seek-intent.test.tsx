import {afterEach, expect, test} from 'bun:test';
import {createRef, useContext} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {Player} from '../Player.js';
import type {PlayerRef} from '../player-methods.js';
import {act, cleanup, render} from './test-utils.js';

afterEach(cleanup);

test('explicit seeks publish intent synchronously, including while playing', () => {
	const playerRef = createRef<PlayerRef>();
	let timeline: React.ContextType<typeof Internals.SetTimelineContext>;
	let frame = 0;
	const Composition = () => {
		timeline = useContext(Internals.SetTimelineContext);
		frame = useCurrentFrame();
		return null;
	};

	render(
		<Player
			ref={playerRef}
			component={Composition}
			durationInFrames={300}
			compositionWidth={1920}
			compositionHeight={1080}
			fps={30}
			numberOfSharedAudioTags={0}
		/>,
	);
	const revision = timeline!.seekRevision!;
	expect(revision.current).toBe(0);
	act(() => {
		playerRef.current!.seekTo(30);
		expect(revision.current).toBe(1);
	});
	expect(frame).toBe(30);
	act(() => playerRef.current!.play());
	expect(revision.current).toBe(1);
	act(() => {
		playerRef.current!.seekTo(180);
		expect(revision.current).toBe(2);
	});
	expect(frame).toBe(180);
	act(() => playerRef.current!.seekTo(15));
	expect(frame).toBe(15);
	expect(revision.current).toBe(3);
	act(() => playerRef.current!.pause());
	expect(revision.current).toBe(3);
});
