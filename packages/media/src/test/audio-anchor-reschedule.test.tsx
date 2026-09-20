import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {expect, type MockInstance, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {Audio} from '../audio/audio';

const mountAudioPlayer = (fps: number, src: string) => {
	const createdNodes: {
		node: AudioBufferSourceNode;
		start: MockInstance<AudioBufferSourceNode['start']>;
		stop: MockInstance<AudioBufferSourceNode['stop']>;
	}[] = [];
	const originalCreateBufferSource = AudioContext.prototype.createBufferSource;
	const createBufferSourceSpy = vi
		.spyOn(AudioContext.prototype, 'createBufferSource')
		.mockImplementation(function (this: AudioContext) {
			const node = originalCreateBufferSource.call(this);
			createdNodes.push({
				node,
				start: vi.spyOn(node, 'start'),
				stop: vi.spyOn(node, 'stop'),
			});
			return node;
		});
	let sharedAudioContext: React.ContextType<
		typeof Internals.SharedAudioContext
	> = null;
	const Composition: React.FC = () => {
		sharedAudioContext = React.useContext(Internals.SharedAudioContext);
		return <Audio src={src} disallowFallbackToHtml5Audio />;
	};

	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	root.render(
		<Player
			ref={playerRef}
			acknowledgeRemotionLicense
			component={Composition}
			compositionWidth={100}
			compositionHeight={100}
			controls
			durationInFrames={300}
			fps={fps}
			inputProps={{}}
		/>,
	);
	return {
		createdNodes,
		playerRef,
		getSharedAudioContext: () => {
			if (!sharedAudioContext?.audioContext) {
				throw new Error('Audio context did not initialize');
			}

			return {
				...sharedAudioContext,
				audioContext: sharedAudioContext.audioContext,
			};
		},
		unmount: () => {
			root.unmount();
			container.remove();
			createBufferSourceSpy.mockRestore();
			vi.restoreAllMocks();
		},
	};
};

test('replaces queued audio after a suspension re-anchors a stationary Player', async () => {
	const player = mountAudioPlayer(30, '/voice-note.m4a');
	const {createdNodes, playerRef} = player;
	try {
		await vi.waitFor(() => {
			expect(
				createdNodes.filter(({node}) => node.buffer !== null).length,
			).toBeGreaterThan(5);
		});
		const context = player.getSharedAudioContext().audioContext;
		const oldNodes = createdNodes.filter(({node}) => node.buffer !== null);
		const oldNodeCount = createdNodes.length;
		// Control only the browser clock/state: reproduce suspension after the
		// audio clock advanced beyond the frozen composition frame.
		vi.spyOn(context, 'currentTime', 'get').mockReturnValue(0.25);
		vi.spyOn(context, 'state', 'get').mockReturnValue('suspended');
		context.dispatchEvent(new Event('statechange'));
		await vi.waitFor(() => {
			expect(oldNodes.every(({stop}) => stop.mock.calls.length > 0)).toBe(true);
			const replacements = createdNodes
				.slice(oldNodeCount)
				.filter(({node}) => node.buffer !== null);
			expect(replacements.length).toBeGreaterThan(5);
		});
		expect(playerRef.current?.getCurrentFrame()).toBe(0);
		expect(playerRef.current?.isPlaying()).toBe(false);
		// Suspended contexts retain the replacement start commands until play.
		playerRef.current?.play();
		await vi.waitFor(() => {
			const replacements = createdNodes
				.slice(oldNodeCount)
				.filter(({node}) => node.buffer !== null);
			expect(replacements[0].start.mock.calls[0]?.[0]).toBeCloseTo(0.25, 4);
		});
	} finally {
		player.unmount();
	}
});

test('replaces queued audio once after a running audio-clock stall', async () => {
	const fps = 25;
	const player = mountAudioPlayer(fps, '/dialogue.wav');
	const {createdNodes, playerRef} = player;
	let removeListener: () => void = () => undefined;
	try {
		await vi.waitFor(() => {
			expect(
				createdNodes.filter(({node}) => node.buffer !== null).length,
			).toBeGreaterThan(5);
		});
		const sharedAudioContext = player.getSharedAudioContext();
		const context = sharedAudioContext.audioContext;
		const nativeClock = Object.getOwnPropertyDescriptor(
			BaseAudioContext.prototype,
			'currentTime',
		)?.get;
		if (!nativeClock) throw new Error('Audio clock did not initialize');
		let heldTime: number | null = null;
		let lostTime = 0;
		vi.spyOn(context, 'currentTime', 'get').mockImplementation(
			() => heldTime ?? (nativeClock.call(context) as number) - lostTime,
		);
		vi.spyOn(context, 'getOutputTimestamp').mockImplementation(() => ({
			contextTime: context.currentTime,
			performanceTime: performance.now(),
		}));
		vi.spyOn(context, 'baseLatency', 'get').mockReturnValue(1024 / 48000);
		vi.spyOn(context, 'outputLatency', 'get').mockReturnValue(0.2);
		await page.getByRole('button', {name: 'Play'}).click();
		await vi.waitFor(
			() => expect(playerRef.current?.getCurrentFrame()).toBeGreaterThan(10),
			{timeout: 5000},
		);

		const frameBeforeStall = playerRef.current!.getCurrentFrame();
		const anchorBeforeStall = sharedAudioContext.audioSyncAnchor.value;
		const oldNodes = createdNodes.filter(
			({node, start}) =>
				node.buffer !== null &&
				start.mock.calls.some(
					([time]) => time !== undefined && time > context.currentTime + 0.3,
				),
		);
		expect(oldNodes.length).toBeGreaterThan(5);
		const oldNodeCount = createdNodes.length;
		let anchorChanges = 0;
		let correctionTime = 0;
		const anchorEvents: unknown[] = [];
		const {remove} = sharedAudioContext.audioSyncAnchorEmitter.subscribe(() => {
			anchorChanges++;
			correctionTime = context.currentTime;
			anchorEvents.push({
				frame: playerRef.current?.getCurrentFrame(),
				time: context.currentTime,
				anchor: sharedAudioContext.audioSyncAnchor.value,
				state: context.state,
				providerState: sharedAudioContext.getAudioContextState(),
			});
		});
		removeListener = remove;

		// Hold the browser clock while frames advance, then resume it without catching up.
		heldTime = context.currentTime;
		await new Promise((resolve) => setTimeout(resolve, 180));
		expect(context.state).toBe('running');
		expect(playerRef.current!.getCurrentFrame()).toBeGreaterThan(
			frameBeforeStall + 2,
		);
		expect(anchorChanges).toBe(0);
		lostTime = (nativeClock.call(context) as number) - heldTime;
		heldTime = null;

		await vi.waitFor(
			() => expect(anchorChanges, JSON.stringify(anchorEvents)).toBe(1),
			{timeout: 2000},
		);
		expect(sharedAudioContext.audioSyncAnchor.value).toBeLessThan(
			anchorBeforeStall - 0.1,
		);
		await vi.waitFor(() => {
			expect(oldNodes.every(({stop}) => stop.mock.calls.length > 0)).toBe(true);
			const replacements = createdNodes
				.slice(oldNodeCount)
				.filter(({node}) => node.buffer !== null);
			expect(replacements.length).toBeGreaterThan(5);
			expect(
				replacements.some(({start}) =>
					start.mock.calls.some(
						([time]) =>
							time !== undefined && Math.abs(time - correctionTime) <= 1 / fps,
					),
				),
			).toBe(true);
		});
		await new Promise((resolve) => setTimeout(resolve, 300));
		expect(anchorChanges).toBe(1);
	} finally {
		removeListener();
		player.unmount();
	}
});
