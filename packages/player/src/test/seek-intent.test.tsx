import {afterEach, expect, test} from 'bun:test';
import React, {createRef, useContext} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {act, cleanup, render} from './test-utils.js';

afterEach(cleanup);

test('Player seeks publish boundaries before frame updates and stay local to each Player', () => {
	const players = [createRef<PlayerRef>(), createRef<PlayerRef>()];
	const ids = ['first', 'second'];
	const timelines: React.ContextType<typeof Internals.SetTimelineContext>[] =
		[];
	const Composition: React.FC<{readonly index: number}> = ({index}) => {
		timelines[index] = useContext(Internals.SetTimelineContext);
		return <output data-testid={`frame-${index}`}>{useCurrentFrame()}</output>;
	};

	const view = render(
		<>
			{players.map((ref, index) => (
				<Player
					key={ids[index]}
					ref={ref}
					component={Composition}
					inputProps={{index}}
					durationInFrames={300}
					compositionWidth={320}
					compositionHeight={180}
					fps={30}
					numberOfSharedAudioTags={0}
				/>
			))}
		</>,
	);
	const {revision} = timelines[0].seek!;
	const events: number[] = [];
	players[0].current!.addEventListener('seeked', () => {
		events.push(revision.current);
	});

	act(() => {
		players[0].current!.seekTo(30);
		expect(revision.current).toBe(1);
	});
	expect(view.getByTestId('frame-0').textContent).toBe('30');
	act(() => players[0].current!.play());
	expect(revision.current).toBe(1);
	act(() => {
		players[0].current!.seekTo(31);
		players[0].current!.seekTo(180);
		players[0].current!.seekTo(15);
	});
	expect(view.getByTestId('frame-0').textContent).toBe('15');
	expect(revision.current).toBe(4);
	act(() => players[0].current!.pause());
	act(() => players[0].current!.seekTo(15));
	expect(revision.current).toBe(5);
	expect(events).toEqual([1, 2, 3, 4, 5]);
	expect(view.getByTestId('frame-1').textContent).toBe('0');
	expect(timelines[1].seek!.revision.current).toBe(0);

	// The animation path updates frames without publishing navigation intent.
	act(() =>
		timelines[0].setFrame((frames) => ({
			...frames,
			[Object.keys(frames)[0]]: 90,
		})),
	);
	expect(view.getByTestId('frame-0').textContent).toBe('90');
	expect(revision.current).toBe(5);
});
