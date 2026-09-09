import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
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
		root.unmount();
		container.remove();
		createBufferSourceSpy.mockRestore();
		vi.restoreAllMocks();
	}
});
