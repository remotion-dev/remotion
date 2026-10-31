import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {useBufferState} from 'remotion';
import {expect, test, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import type {AudioIteratorManager} from '../audio-iterator-manager';
import {Audio} from '../audio/audio';
import {MediaPlayer} from '../media-player';
import {PremountAwareDelayPlayback} from '../premount-aware-delay-playback';

// With _experimentalKeepAudioContextAlive, the audio clock keeps running while
// the Player buffers, so the frame effect moves the anchor once playback
// resumes. Audio that played out silently meanwhile has to be decoded again.
// If that restart waited for audio, it buffered the Player again, the clock
// drifted again, and a composition with several sounds never resumed.
test('audio re-synced after the Player buffered does not buffer it again', async () => {
	const players: MediaPlayer[] = [];
	const originalInitialize = MediaPlayer.prototype.initialize;
	vi.spyOn(MediaPlayer.prototype, 'initialize').mockImplementation(function (
		this: MediaPlayer,
		...args
	) {
		players.push(this);
		return originalInitialize.apply(this, args);
	});
	const createHandle = vi.spyOn(
		PremountAwareDelayPlayback.prototype,
		'createHandle',
	);
	let buffer: ReturnType<typeof useBufferState> | null = null;
	const Composition: React.FC = () => {
		buffer = useBufferState();
		return <Audio src="/voice-note.m4a" disallowFallbackToHtml5Audio />;
	};

	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const ref = React.createRef<PlayerRef>();
	root.render(
		<Player
			ref={ref}
			component={Composition}
			durationInFrames={300}
			compositionWidth={100}
			compositionHeight={100}
			fps={30}
			acknowledgeRemotionLicense
			_experimentalKeepAudioContextAlive
		/>,
	);
	const manager = (player: MediaPlayer) =>
		(player as unknown as {audioIteratorManager: AudioIteratorManager})
			.audioIteratorManager;
	try {
		await vi.waitFor(() => {
			expect(players).toHaveLength(1);
			expect(
				manager(players[0])?.getAudioBufferIterator()?.getQueuedPeriod(),
			).not.toBeNull();
		});
		const [player] = players;
		const button = document.createElement('button');
		button.textContent = 'start';
		button.onclick = () => ref.current!.play();
		container.appendChild(button);
		await userEvent.click(button);
		button.remove();
		await vi.waitFor(() =>
			expect(ref.current!.getCurrentFrame()).toBeGreaterThan(5),
		);

		// Buffer longer than the anchor tolerance (0.1 s + latency, at most
		// ~0.45 s with the 0.3 s fallback output latency): the audio clock runs
		// ahead and the audio queued for the frozen frame plays out silently.
		const handle = flushSync(() => buffer!.delayPlayback());
		await new Promise((resolve) => setTimeout(resolve, 1000));
		const frozenFrame = ref.current!.getCurrentFrame();
		const iteratorsBefore = manager(player).getAudioIteratorsCreated();
		const anchorChanged = vi.spyOn(player, 'audioSyncAnchorChanged');
		createHandle.mockClear();
		handle.unblock();

		await vi.waitFor(() => {
			expect(anchorChanged).toHaveBeenCalled();
			expect(manager(player).getAudioIteratorsCreated()).toBeGreaterThan(
				iteratorsBefore,
			);
		});
		await Promise.all(anchorChanged.mock.results.map((r) => r.value));
		// The re-synced audio catches up in the background.
		expect(createHandle).not.toHaveBeenCalled();
		await vi.waitFor(() =>
			expect(ref.current!.getCurrentFrame()).toBeGreaterThan(frozenFrame + 10),
		);
	} finally {
		root.unmount();
		container.remove();
		vi.restoreAllMocks();
	}
});
