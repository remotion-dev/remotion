import {Player, type PlayerRef} from '@remotion/player';
import {AudioBufferSink} from 'mediabunny';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {MediaPlayer} from '../media-player';
import {Video} from '../video/video';

test.each([false, true])(
	'keeps the audio decoder while a 4x composition loop is buffering (keep alive: %s)',
	async (keepAlive) => {
		let now = 0;
		let audioTime = 0;
		let audioRunning = false;
		let nextFrameId = 0;
		const callbacks = new Map<number, FrameRequestCallback>();
		const scheduledNodes = new Map<AudioBufferSourceNode, number>();
		const states = new WeakMap<AudioContext, AudioContextState>();
		vi.spyOn(performance, 'now').mockImplementation(() => now);
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
			callbacks.set(++nextFrameId, callback);
			return nextFrameId;
		});
		vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
			callbacks.delete(id);
		});
		vi.spyOn(AudioContext.prototype, 'state', 'get').mockImplementation(
			function (this: AudioContext) {
				return states.get(this) ?? 'suspended';
			},
		);
		vi.spyOn(AudioContext.prototype, 'currentTime', 'get').mockImplementation(
			() => audioTime,
		);
		vi.spyOn(AudioContext.prototype, 'getOutputTimestamp').mockImplementation(
			() => ({contextTime: audioTime, performanceTime: now}),
		);
		vi.spyOn(AudioBufferSourceNode.prototype, 'start').mockImplementation(
			function (this: AudioBufferSourceNode, when, offset, duration) {
				scheduledNodes.set(
					this,
					Math.max(when ?? 0, audioTime) +
						(duration ?? this.buffer!.duration - (offset ?? 0)) /
							this.playbackRate.value,
				);
			},
		);
		vi.spyOn(AudioBufferSourceNode.prototype, 'stop').mockImplementation(
			function (this: AudioBufferSourceNode) {
				scheduledNodes.delete(this);
			},
		);
		for (const [method, state] of [
			['resume', 'running'],
			['suspend', 'suspended'],
		] as const) {
			vi.spyOn(AudioContext.prototype, method).mockImplementation(
				function (this: AudioContext) {
					states.set(this, state);
					audioRunning = state === 'running';
					queueMicrotask(() => this.dispatchEvent(new Event('statechange')));
					return Promise.resolve();
				},
			);
		}

		const advance = (milliseconds: number) => {
			now += milliseconds;
			if (audioRunning) audioTime += milliseconds / 1000;
			for (const [node, endTime] of scheduledNodes) {
				if (endTime <= audioTime) {
					scheduledNodes.delete(node);
					node.dispatchEvent(new Event('ended'));
				}
			}

			const pending = [...callbacks.values()];
			callbacks.clear();
			flushSync(() => {
				for (const callback of pending) callback(now);
			});
		};

		let holdBeginning = false;
		let releaseBeginning = () => {};
		const beginningReleased = new Promise<void>((resolve) => {
			releaseBeginning = resolve;
		});
		let enteredBeginning = () => {};
		const beginningEntered = new Promise<void>((resolve) => {
			enteredBeginning = resolve;
		});
		const originalBuffers = AudioBufferSink.prototype.buffers;
		vi.spyOn(AudioBufferSink.prototype, 'buffers').mockImplementation(
			async function* (this: AudioBufferSink, ...args) {
				if (holdBeginning && (args[0] ?? 0) < 1) {
					enteredBeginning();
					await beginningReleased;
				}

				yield* originalBuffers.apply(this, args);
			},
		);
		let player: MediaPlayer | null = null;
		let initialization: ReturnType<MediaPlayer['initialize']> | null = null;
		const originalInitialize = MediaPlayer.prototype.initialize;
		vi.spyOn(MediaPlayer.prototype, 'initialize').mockImplementation(function (
			this: MediaPlayer,
			...args
		) {
			player = this;
			initialization = originalInitialize.apply(this, args);
			return initialization;
		});
		let shared: React.ContextType<typeof Internals.SharedAudioContext> = null;
		let timeline: React.ContextType<
			typeof Internals.SetTimelineContext
		> | null = null;
		const errors: Error[] = [];
		const Composition = () => {
			shared = React.useContext(Internals.SharedAudioContext);
			timeline = React.useContext(Internals.SetTimelineContext);
			return (
				<Video
					src="/video.mp4"
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
		root.render(
			<Player
				ref={ref}
				component={Composition}
				durationInFrames={300}
				compositionWidth={320}
				compositionHeight={180}
				fps={30}
				initialFrame={294}
				playbackRate={4}
				loop
				acknowledgeRemotionLicense
				_experimentalKeepAudioContextAlive={keepAlive}
			/>,
		);
		const manager = () => player!.audioIteratorManager!;
		try {
			await vi.waitFor(
				() => {
					expect(errors).toEqual([]);
					expect(initialization).not.toBeNull();
				},
				{timeout: 10000},
			);
			await initialization;
			await vi.waitFor(
				() => {
					expect(
						manager()?.getAudioBufferIterator()?.getQueuedPeriod()?.until,
					).toBeGreaterThan(9.8);
					expect(timeline!.isBuffering()).toBe(false);
				},
				{timeout: 10000},
			);
			flushSync(() => ref.current!.play());
			advance(1);
			await vi.waitFor(() =>
				expect(shared!.getIsResumingAudioContext()).toBeNull(),
			);
			const before = manager().getAudioIteratorsCreated();
			const anchorChanged = vi.spyOn(player!, 'audioSyncAnchorChanged');
			holdBeginning = true;
			advance(50);
			await beginningEntered;
			await vi.waitFor(() => expect(timeline!.isBuffering()).toBe(true));
			advance(1);
			await vi.waitFor(() =>
				expect(shared!.getAudioContextState()).toBe(
					keepAlive ? 'running' : 'suspended',
				),
			);
			await Promise.all(
				anchorChanged.mock.results.map((result) => result.value),
			);
			advance(500);
			expect(ref.current!.getCurrentFrame()).toBe(0);
			expect(manager().getAudioIteratorsCreated()).toBe(before + 1);
			releaseBeginning();
			await vi.waitFor(() => expect(timeline!.isBuffering()).toBe(false));
			advance(1);
			advance(keepAlive ? 1 : 20);
			await vi.waitFor(() =>
				expect(shared!.getIsResumingAudioContext()).toBeNull(),
			);
			advance(50);
			expect(ref.current!.getCurrentFrame()).toBe(6);
			expect(manager().getAudioBufferIterator()?.getQueuedPeriod()?.from).toBe(
				0,
			);
			expect(
				manager().getAudioBufferIterator()?.getQueuedPeriod()?.until,
			).toBeGreaterThanOrEqual(0.1);
			expect(manager().getAudioIteratorsCreated()).toBe(before + 1);
			expect(errors).toEqual([]);
		} finally {
			releaseBeginning();
			root.unmount();
			container.remove();
			vi.restoreAllMocks();
		}
	},
	15000,
);
