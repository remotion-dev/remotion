import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals, Sequence, useBufferState} from 'remotion';
import {expect, test, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import type {AudioIteratorManager} from '../audio-iterator-manager';
import {Audio} from '../audio/audio';
import {MediaPlayer} from '../media-player';

// KINO-7449: re-anchoring every mounted audio item used to reopen its decoder,
// even when the same local frame was already prepared in a frozen premount.
test.each([false, true])(
	'reuses prepared audio across anchor changes (keep alive: %s)',
	async (keepAlive) => {
		const wav = new Uint8Array(44 + 8 * 8000 * 2);
		const view = new DataView(wav.buffer);
		for (const [offset, text] of [
			[0, 'RIFF'],
			[8, 'WAVEfmt '],
			[36, 'data'],
		] as const)
			wav.set(new TextEncoder().encode(text), offset);
		view.setUint32(4, wav.length - 8, true);
		view.setUint32(16, 16, true);
		view.setUint16(20, 1, true);
		view.setUint16(22, 1, true);
		view.setUint32(24, 8000, true);
		view.setUint32(28, 16000, true);
		view.setUint16(32, 2, true);
		view.setUint16(34, 16, true);
		view.setUint32(40, wav.length - 44, true);
		const src = URL.createObjectURL(new Blob([wav], {type: 'audio/wav'}));
		const players: MediaPlayer[] = [];
		const originalInitialize = MediaPlayer.prototype.initialize;
		vi.spyOn(MediaPlayer.prototype, 'initialize').mockImplementation(function (
			this: MediaPlayer,
			...args
		) {
			players.push(this);
			return originalInitialize.apply(this, args);
		});
		let shared: React.ContextType<typeof Internals.SharedAudioContext> = null;
		let buffer: ReturnType<typeof useBufferState> | null = null;
		const Composition = () => {
			buffer = useBufferState();
			shared = React.useContext(Internals.SharedAudioContext);
			return (
				<>
					<Audio src={src} />
					<Sequence from={30} durationInFrames={120} premountFor={120}>
						<Audio src={src} trimBefore={10} playbackRate={1.25} />
					</Sequence>
				</>
			);
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
				_experimentalKeepAudioContextAlive={keepAlive}
			/>,
		);
		const manager = (player: MediaPlayer) =>
			(player as unknown as {audioIteratorManager: AudioIteratorManager})
				.audioIteratorManager;
		try {
			await vi.waitFor(() => {
				expect(players).toHaveLength(2);
				for (const p of players)
					expect(
						manager(p)?.getAudioBufferIterator()?.getQueuedPeriod()?.until,
					).toBeGreaterThan(1);
			});
			const initial = players.map((p) => manager(p).getAudioIteratorsCreated());
			const anchorChanged = players.map((p) =>
				vi.spyOn(p, 'audioSyncAnchorChanged'),
			);
			for (let i = 0; i < 5; i++) {
				shared!.audioSyncAnchor.value += 0.25;
				shared!.audioSyncAnchorEmitter.dispatch('changed');
				await Promise.all(
					anchorChanged.map((spy) => spy.mock.results.at(-1)!.value),
				);
				await vi.waitFor(() => {
					for (const spy of anchorChanged)
						expect(spy).toHaveBeenCalledTimes(i + 1);
				});
			}

			expect(players.map((p) => manager(p).getAudioIteratorsCreated())).toEqual(
				initial,
			);
			// Playback, waiting, and repeated published buffering state go through
			// the real Player clock rather than direct MediaPlayer play/pause mocks.
			const button = document.createElement('button');
			button.textContent = 'start';
			button.onclick = () => ref.current!.play();
			container.appendChild(button);
			await userEvent.click(button);
			button.remove();
			await vi.waitFor(() =>
				expect(ref.current!.getCurrentFrame()).toBeGreaterThan(0),
			);
			// Commit buffering and pending playback frames before sampling the freeze.
			const handle = flushSync(() => buffer!.delayPlayback());
			const frozenFrame = ref.current!.getCurrentFrame();
			await new Promise((resolve) => setTimeout(resolve, 150));
			expect(ref.current!.getCurrentFrame()).toBe(frozenFrame);
			handle.unblock();
			await vi.waitFor(() =>
				expect(ref.current!.getCurrentFrame()).toBeGreaterThan(frozenFrame),
			);
			flushSync(() => ref.current!.pause());
			const pausedFrame = ref.current!.getCurrentFrame();
			await new Promise((resolve) => setTimeout(resolve, 100));
			expect(ref.current!.getCurrentFrame()).toBe(pausedFrame);
			// A real backwards seek behind the live queue still starts from the target.
			expect(manager(players[1]).getAudioIteratorsCreated()).toBe(initial[1]);
			const beforeForward = manager(players[0]).getAudioIteratorsCreated();
			ref.current!.seekTo(120);
			await vi.waitFor(() => expect(ref.current!.getCurrentFrame()).toBe(120));
			await vi.waitFor(() =>
				expect(manager(players[0]).getAudioIteratorsCreated()).toBeGreaterThan(
					beforeForward,
				),
			);
			const beforeReverse = manager(players[0]).getAudioIteratorsCreated();
			ref.current!.seekTo(0);
			await vi.waitFor(() => expect(ref.current!.getCurrentFrame()).toBe(0));
			await vi.waitFor(() =>
				expect(manager(players[0]).getAudioIteratorsCreated()).toBeGreaterThan(
					beforeReverse,
				),
			);
		} finally {
			root.unmount();
			container.remove();
			URL.revokeObjectURL(src);
			vi.restoreAllMocks();
		}

		await vi.waitFor(() => {
			for (const p of players)
				expect(manager(p)?.getAudioBufferIterator()).toBeNull();
		});
	},
);
