import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React from 'react';
import {Sequence} from 'remotion';
import {Canvas, createCanvasController} from '../index';

afterEach(() => {
	cleanup();
});

const Composition: React.FC<{
	readonly showNestedSequence: boolean;
}> = ({showNestedSequence}) => {
	return (
		<Sequence name="Parent" from={0} durationInFrames={80} layout="none">
			{showNestedSequence ? (
				<Sequence name="Child" from={5} durationInFrames={40} layout="none">
					<div />
				</Sequence>
			) : null}
		</Sequence>
	);
};

test('publishes the live timeline from the Player composition', async () => {
	const controller = createCanvasController();
	let updates = 0;
	const unsubscribe = controller.timeline.subscribe(() => {
		updates++;
	});

	const view = render(
		<Canvas
			controller={controller}
			component={Composition}
			inputProps={{showNestedSequence: false}}
			durationInFrames={100}
			compositionWidth={1920}
			compositionHeight={1080}
			fps={30}
			initialFrame={10}
			numberOfSharedAudioTags={0}
			initiallyMuted
			acknowledgeRemotionLicense
		/>,
	);

	await waitFor(() => {
		expect(
			controller.timeline
				.getSnapshot()
				.map((track) => track.sequence.displayName),
		).toEqual(['Parent']);
	});

	view.rerender(
		<Canvas
			controller={controller}
			component={Composition}
			inputProps={{showNestedSequence: true}}
			durationInFrames={100}
			compositionWidth={1920}
			compositionHeight={1080}
			fps={30}
			initialFrame={10}
			numberOfSharedAudioTags={0}
			initiallyMuted
			acknowledgeRemotionLicense
		/>,
	);

	await waitFor(() => {
		const tracks = controller.timeline.getSnapshot();
		expect(tracks.map((track) => track.sequence.displayName)).toEqual([
			'Parent',
			'Child',
		]);
		expect(tracks.map((track) => track.depth)).toEqual([0, 1]);
	});

	expect(updates).toBeGreaterThan(0);
	unsubscribe();
	view.unmount();
	expect(controller.timeline.getSnapshot()).toEqual([]);
});
