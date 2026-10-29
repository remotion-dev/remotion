import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Internals, Sequence} from 'remotion';
import {expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {Audio} from '../audio/audio';

test('replaces queued audio after a suspension re-anchors a stationary Player', async () => {
	const createdNodes: {
		node: AudioBufferSourceNode;
		start: ReturnType<typeof vi.spyOn>;
		stop: ReturnType<typeof vi.spyOn>;
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
	let audioContext: AudioContext | null = null;
	const Composition: React.FC = () => {
		audioContext =
			React.useContext(Internals.SharedAudioContext)?.audioContext ?? null;
		return <Audio src="/voice-note.m4a" disallowFallbackToHtml5Audio />;
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
			durationInFrames={300}
			fps={30}
			inputProps={{}}
		/>,
	);
	try {
		await vi.waitFor(() => {
			expect(
				createdNodes.filter(({node}) => node.buffer !== null).length,
			).toBeGreaterThan(5);
		});
		if (!audioContext) throw new Error('Audio context did not initialize');
		const context: AudioContext = audioContext;
		const oldNodes = createdNodes.filter(({node}) => node.buffer !== null);
		const oldNodeCount = createdNodes.length;
		// Control only the browser clock/state: reproduce suspension after the
		// audio clock advanced beyond the frozen composition frame.
		vi.spyOn(context, 'currentTime', 'get').mockReturnValue(0.25);
		vi.spyOn(context, 'state', 'get').mockReturnValue('suspended');
		context.dispatchEvent(new Event('statechange'));
		await vi.waitFor(() => {
			for (const {start, stop} of oldNodes) {
				if (start.mock.calls.length > 0) expect(stop).toHaveBeenCalled();
				else expect(stop).not.toHaveBeenCalled();
			}

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
		root.unmount();
		container.remove();
		createBufferSourceSpy.mockRestore();
		vi.restoreAllMocks();
	}
});

test('paused seeks unschedule unstarted nodes while playing cleanup still stops started nodes', async () => {
	const nodes: {
		node: AudioBufferSourceNode;
		start: ReturnType<typeof vi.spyOn>;
		stop: ReturnType<typeof vi.spyOn>;
	}[] = [];
	const {createBufferSource} = AudioContext.prototype;
	const spy = vi
		.spyOn(AudioContext.prototype, 'createBufferSource')
		.mockImplementation(function (this: AudioContext) {
			const node = createBufferSource.call(this);
			nodes.push({
				node,
				start: vi.spyOn(node, 'start'),
				stop: vi.spyOn(node, 'stop'),
			});
			return node;
		});
	const Composition: React.FC = () => (
		<Audio src="/voice-note.m4a" disallowFallbackToHtml5Audio />
	);
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
			durationInFrames={300}
			fps={30}
			inputProps={{}}
		/>,
	);
	try {
		await vi.waitFor(() =>
			expect(
				nodes.filter(({node}) => node.buffer !== null).length,
			).toBeGreaterThan(5),
		);
		const pending = nodes.filter(({node}) => node.buffer !== null);
		expect(pending.every(({start}) => start.mock.calls.length === 0)).toBe(
			true,
		);
		const beforeSeek = nodes.length;
		playerRef.current!.seekTo(30);
		await vi.waitFor(() =>
			expect(
				nodes.slice(beforeSeek).filter(({node}) => node.buffer !== null).length,
			).toBeGreaterThan(5),
		);
		for (const {stop} of pending) expect(stop).not.toHaveBeenCalled();
		playerRef.current!.play();
		await vi.waitFor(() =>
			expect(
				nodes.some(
					({node, start}) =>
						node.buffer !== null && start.mock.calls.length > 0,
				),
			).toBe(true),
		);
		const started = nodes.filter(
			({node, start}) => node.buffer !== null && start.mock.calls.length > 0,
		);
		root.unmount();
		await vi.waitFor(() => {
			for (const {stop} of started) expect(stop).toHaveBeenCalled();
		});
		for (const {node, start, stop} of nodes) {
			if (node.buffer !== null && start.mock.calls.length === 0)
				expect(stop).not.toHaveBeenCalled();
		}
	} finally {
		if (container.hasChildNodes()) root.unmount();
		container.remove();
		spy.mockRestore();
		vi.restoreAllMocks();
	}
});

test.each([
	{from: 0, playbackRate: 1},
	{from: 90, playbackRate: 1},
	{from: 90, playbackRate: 0.01},
])(
	'keep-alive bounds paused audio from frame $from at $playbackRate× without blocking playback',
	async ({from, playbackRate}) => {
		const nodes: AudioBufferSourceNode[] = [];
		const originalCreateBufferSource =
			AudioContext.prototype.createBufferSource;
		const createBufferSourceSpy = vi
			.spyOn(AudioContext.prototype, 'createBufferSource')
			.mockImplementation(function (this: AudioContext) {
				const node = originalCreateBufferSource.call(this);
				nodes.push(node);
				return node;
			});
		let audioContext: AudioContext | null = null;
		const Composition: React.FC = () => {
			audioContext =
				React.useContext(Internals.SharedAudioContext)?.audioContext ?? null;
			return (
				<Sequence from={from} premountFor={from}>
					<Audio
						src="/voice-note.m4a"
						playbackRate={playbackRate}
						disallowFallbackToHtml5Audio
					/>
				</Sequence>
			);
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
				durationInFrames={4000}
				fps={30}
				inputProps={{}}
				_experimentalKeepAudioContextAlive
			/>,
		);
		try {
			await vi.waitFor(() => {
				expect(
					nodes.reduce((sum, node) => sum + (node.buffer?.duration ?? 0), 0),
				).toBeGreaterThanOrEqual(0.1);
			});
			if (!audioContext) throw new Error('Audio context did not initialize');
			const context: AudioContext = audioContext;
			const resumeButton = document.createElement('button');
			resumeButton.textContent = 'Resume audio context';
			resumeButton.onclick = () => context.resume();
			container.appendChild(resumeButton);
			await page.getByRole('button', {name: 'Resume audio context'}).click();
			await vi.waitFor(() => expect(context.state).toBe('running'));
			const startedAt = context.currentTime;
			// Let the real audio clock move beyond the two-second decode horizon.
			await vi.waitFor(
				() => {
					expect(context.currentTime - startedAt).toBeGreaterThan(3);
				},
				{timeout: 5000},
			);
			expect(playerRef.current?.getCurrentFrame()).toBe(0);
			expect(playerRef.current?.isPlaying()).toBe(false);
			const queuedDuration = nodes.reduce(
				(sum, node) => sum + (node.buffer?.duration ?? 0),
				0,
			);
			// The final decoded chunk can straddle the two-second boundary.
			expect(queuedDuration).toBeGreaterThanOrEqual(
				Math.max(1.9 * playbackRate, 0.1),
			);
			expect(queuedDuration).toBeLessThan(Math.max(2.2 * playbackRate, 0.2));
			playerRef.current?.play();
			await vi.waitFor(
				() => {
					expect(playerRef.current?.getCurrentFrame()).toBeGreaterThan(
						from + 5,
					);
				},
				{timeout: 5000},
			);
		} finally {
			root.unmount();
			container.remove();
			createBufferSourceSpy.mockRestore();
		}
	},
	15000,
);
