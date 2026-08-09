import {afterEach, expect, test} from 'bun:test';
import React, {createRef, useRef} from 'react';
import {Html5Audio, Internals, useCurrentFrame} from 'remotion';
import type {PlayerRef} from '../player-methods.js';
import {Player} from '../Player.js';
import type {UsePlayerMethods} from '../use-player-methods.js';
import {usePlayerMethods} from '../use-player-methods.js';
import {act, cleanup, fireEvent, render} from './test-utils.js';

afterEach(() => {
	cleanup();
});

test('It should throw an error if not being used inside a RemotionRoot', () => {
	expect(() => {
		usePlayerMethods();
	}).toThrow();
});

test('Seeking to the current frame does not rerender the composition', () => {
	let compositionRenders = 0;
	const playerRef = createRef<PlayerRef>();
	const Composition = () => {
		compositionRenders++;
		const frame = useCurrentFrame();
		return React.createElement('div', null, `Frame ${frame}`);
	};

	const view = render(
		React.createElement(Player, {
			ref: playerRef,
			component: Composition,
			durationInFrames: 100,
			compositionWidth: 1920,
			compositionHeight: 1080,
			fps: 30,
		}),
	);
	const rendersAfterMount = compositionRenders;
	expect(view.getByText('Frame 0')).toBeTruthy();

	act(() => {
		playerRef.current?.seekTo(0);
	});

	expect(playerRef.current?.getCurrentFrame()).toBe(0);
	expect(compositionRenders).toBe(rendersAfterMount);
});

const PlayerMethodsProbe = React.memo(
	({onRender}: {readonly onRender: (methods: UsePlayerMethods) => void}) => {
		const methods = usePlayerMethods();
		onRender(methods);
		return null;
	},
);

test('Imperative player methods do not rerender when the frame changes', () => {
	const playerRef = createRef<PlayerRef>();
	const methodsRef: {current: UsePlayerMethods | null} = {current: null};
	let methodRenders = 0;
	const onRender = (methods: UsePlayerMethods) => {
		methodsRef.current = methods;
		methodRenders++;
	};

	const renderCustomControls = () =>
		React.createElement(PlayerMethodsProbe, {onRender});
	const Composition = () => null;

	render(
		React.createElement(Player, {
			ref: playerRef,
			component: Composition,
			durationInFrames: 100,
			compositionWidth: 1920,
			compositionHeight: 1080,
			fps: 30,
			initialFrame: 12,
			controls: true,
			renderCustomControls,
		}),
	);

	expect(methodsRef.current?.getCurrentFrame()).toBe(12);
	const rendersAfterMount = methodRenders;

	act(() => {
		methodsRef.current?.seek(30);
	});

	expect(playerRef.current?.getCurrentFrame()).toBe(30);
	expect(methodsRef.current?.getCurrentFrame()).toBe(30);
	expect(methodRenders).toBe(rendersAfterMount);

	act(() => {
		methodsRef.current?.frameForward(5);
		expect(methodsRef.current?.getCurrentFrame()).toBe(35);
		methodsRef.current?.frameBack(2);
		expect(methodsRef.current?.getCurrentFrame()).toBe(33);
	});

	expect(playerRef.current?.getCurrentFrame()).toBe(33);
	expect(methodRenders).toBe(rendersAfterMount);
});

test('Player methods fall back when core has no timeline imperative context', () => {
	const internalsWithOptionalContext = Internals as {
		TimelineImperativeContext?: typeof Internals.TimelineImperativeContext;
	};
	const timelineImperativeContext =
		internalsWithOptionalContext.TimelineImperativeContext;
	delete internalsWithOptionalContext.TimelineImperativeContext;

	try {
		const methodsRef: {current: UsePlayerMethods | null} = {current: null};
		const renderCustomControls = () =>
			React.createElement(PlayerMethodsProbe, {
				onRender: (methods) => {
					methodsRef.current = methods;
				},
			});

		render(
			React.createElement(Player, {
				component: () => null,
				durationInFrames: 100,
				compositionWidth: 1920,
				compositionHeight: 1080,
				fps: 30,
				controls: true,
				renderCustomControls,
			}),
		);

		expect(methodsRef.current?.getCurrentFrame()).toBe(0);
		act(() => methodsRef.current?.seek(20));
		expect(methodsRef.current?.getCurrentFrame()).toBe(20);
	} finally {
		internalsWithOptionalContext.TimelineImperativeContext =
			timelineImperativeContext;
	}
});

test('Playing from the last frame resets playback and dismisses the unplayed poster', () => {
	const playerRef = createRef<PlayerRef>();
	const Composition = () => null;
	const view = render(
		React.createElement(Player, {
			ref: playerRef,
			component: Composition,
			durationInFrames: 10,
			compositionWidth: 1920,
			compositionHeight: 1080,
			fps: 30,
			initialFrame: 9,
			controls: true,
			showPosterWhenUnplayed: true,
			renderPoster: () => React.createElement('div', null, 'Unplayed poster'),
		}),
	);

	expect(view.getByText('Unplayed poster')).toBeTruthy();
	fireEvent.click(view.getByLabelText('Play video'));

	expect(playerRef.current?.getCurrentFrame()).toBe(0);
	expect(playerRef.current?.isPlaying()).toBe(true);
	expect(view.queryByText('Unplayed poster')).toBeNull();

	fireEvent.click(view.getByLabelText('Pause video'));
	expect(playerRef.current?.isPlaying()).toBe(false);
	expect(view.queryByText('Unplayed poster')).toBeNull();
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
