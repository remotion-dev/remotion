import {afterEach, expect, spyOn, test} from 'bun:test';
import {Video} from '@remotion/media';
import {Player, PlayerInternals} from '@remotion/player';
import {cleanup, render, waitFor} from '@testing-library/react';
import React from 'react';
import type {TSequence} from 'remotion';
import {shouldShowTrackInTimeline} from '../components/Timeline/should-show-track-in-timeline';
import {calculateTimeline} from '../helpers/calculate-timeline';

afterEach(cleanup);

test('a trimmed Video keeps one timeline layer when native playback takes over', async () => {
	const isPlayer = Object.getOwnPropertyDescriptor(window, 'remotion_isPlayer');
	// Simulate an unavailable browser canvas without starting a browser or fetching media.
	const getContext = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'getContext',
	);
	Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
		configurable: true,
		value: () => null,
	});
	const consoleError = spyOn(console, 'error').mockImplementation(
		() => undefined,
	);
	const src = 'http://localhost:3000/whats2.mp4';
	let sequences: TSequence[] = [];
	const Composition: React.FC = () => (
		<Video src={src} trimBefore={191} durationInFrames={224} />
	);

	try {
		const {container} = render(
			<PlayerInternals.TimelineSequenceObserverContext.Provider
				value={(registered) => {
					sequences = registered;
				}}
			>
				<Player
					acknowledgeRemotionLicense
					component={Composition}
					compositionWidth={320}
					compositionHeight={180}
					durationInFrames={720}
					fps={30}
					initiallyMuted
					numberOfSharedAudioTags={0}
				/>
			</PlayerInternals.TimelineSequenceObserverContext.Provider>,
		);

		await waitFor(() => {
			expect(container.querySelector('video')?.src.split('#')[0]).toBe(src);
		});
		const tracks = calculateTimeline({sequences, overrideIdsToNodePaths: {}})
			.filter((track) => shouldShowTrackInTimeline(track, 720))
			.map((track) => track.sequence);
		expect(tracks).toMatchObject([
			{type: 'video', src, duration: 224, startMediaFrom: 191},
		]);
	} finally {
		cleanup();
		if (isPlayer) {
			Object.defineProperty(window, 'remotion_isPlayer', isPlayer);
		} else {
			Reflect.deleteProperty(window, 'remotion_isPlayer');
		}

		if (getContext) {
			Object.defineProperty(
				HTMLCanvasElement.prototype,
				'getContext',
				getContext,
			);
		} else {
			Reflect.deleteProperty(HTMLCanvasElement.prototype, 'getContext');
		}

		consoleError.mockRestore();
	}
});
