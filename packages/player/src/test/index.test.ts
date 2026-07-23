import {afterEach, expect, test} from 'bun:test';
import React, {useRef} from 'react';
import {Html5Audio, Internals} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import {usePlayer} from '../use-player.js';
import {act, cleanup, render} from './test-utils.js';

afterEach(() => {
	cleanup();
});

test('It should throw an error if not being used inside a RemotionRoot', () => {
	expect(() => {
		usePlayer();
	}).toThrow();
});

let createdAudioContexts = 0;

class MockAudioContext {
	public state = 'suspended' as AudioContextState;
	public baseLatency = 0;
	public outputLatency = 0;
	public currentTime = 0;
	public destination = {};

	constructor() {
		createdAudioContexts++;
	}

	addEventListener() {
		return undefined;
	}

	removeEventListener() {
		return undefined;
	}

	createGain() {
		return {
			connect: () => undefined,
			gain: {
				cancelScheduledValues: () => undefined,
				linearRampToValueAtTime: () => undefined,
				setValueAtTime: () => undefined,
			},
		};
	}

	suspend() {
		this.state = 'suspended';
		return Promise.resolve();
	}

	resume() {
		this.state = 'running';
		return Promise.resolve();
	}

	createMediaElementSource() {
		return {
			connect: () => undefined,
			disconnect: () => undefined,
		};
	}
}

const AudioComposition = () => {
	return React.createElement(
		Internals.SequenceManager.Provider,
		{
			value: {
				registerSequence: () => undefined,
				unregisterSequence: () => undefined,
				sequences: [],
			},
		},
		React.createElement(Html5Audio, {src: 'audio.mp3'}),
	);
};

const PlayerWithMuteButton = ({
	onError,
	initiallyMuted = false,
}: {
	readonly onError: (error: Error) => void;
	readonly initiallyMuted?: boolean;
}) => {
	const playerRef = useRef<PlayerRef>(null);

	return React.createElement(
		React.Fragment,
		null,
		React.createElement(Player, {
			ref: playerRef,
			component: AudioComposition,
			durationInFrames: 300,
			compositionWidth: 1920,
			compositionHeight: 1080,
			fps: 30,
			initiallyMuted,
			errorFallback: ({error}) => {
				onError(error);
				return null;
			},
		}),
		React.createElement(
			'button',
			{
				type: 'button',
				onClick: () =>
					initiallyMuted
						? playerRef.current?.unmute()
						: playerRef.current?.mute(),
			},
			initiallyMuted ? 'Unmute' : 'Mute',
		),
	);
};

test('It does not crash when muting a Player with a mounted Html5Audio tag', () => {
	const originalAudioContext = globalThis.AudioContext;
	globalThis.AudioContext = MockAudioContext as unknown as typeof AudioContext;
	const errors: Error[] = [];

	try {
		const {getByText} = render(
			React.createElement(PlayerWithMuteButton, {
				onError: (error) => errors.push(error),
			}),
		);

		act(() => {
			getByText('Mute').click();
		});

		expect(errors).toEqual([]);
	} finally {
		globalThis.AudioContext = originalAudioContext;
	}
});

test('It does not crash when unmuting a Player with a mounted Html5Audio tag', () => {
	const originalAudioContext = globalThis.AudioContext;
	globalThis.AudioContext = MockAudioContext as unknown as typeof AudioContext;
	const errors: Error[] = [];
	createdAudioContexts = 0;

	try {
		const {getByText} = render(
			React.createElement(PlayerWithMuteButton, {
				initiallyMuted: true,
				onError: (error) => errors.push(error),
			}),
		);

		expect(createdAudioContexts).toBe(0);

		act(() => {
			getByText('Unmute').click();
		});

		expect(createdAudioContexts).toBe(1);
		expect(errors).toEqual([]);
	} finally {
		globalThis.AudioContext = originalAudioContext;
	}
});
