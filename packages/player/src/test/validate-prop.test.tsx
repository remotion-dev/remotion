import {afterEach, expect, test} from 'bun:test';
import type {ComponentType} from 'react';
import {Composition} from 'remotion';
import {Player} from '../index.js';
import {cleanup, HelloWorld, render} from './test-utils.js';

const originalAudioContext = globalThis.AudioContext;

const mockAudioContext = () => {
	let createdAudioContexts = 0;

	class MockAudioContext {
		state = 'suspended';
		destination = {};

		constructor() {
			createdAudioContexts++;
		}

		createGain() {
			return {
				connect: () => undefined,
			};
		}

		resume() {
			return Promise.resolve();
		}

		suspend() {
			return Promise.resolve();
		}

		addEventListener() {
			return undefined;
		}

		removeEventListener() {
			return undefined;
		}
	}

	globalThis.AudioContext =
		MockAudioContext as unknown as typeof globalThis.AudioContext;

	return () => createdAudioContexts;
};

afterEach(() => {
	cleanup();
	globalThis.AudioContext = originalAudioContext;
});

test('no compositionWidth should give errors', () => {
	try {
		render(
			<Player
				// @ts-expect-error
				compositionWidth={null}
				errorFallback={() => 'something went wrong'}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/'compositionWidth' must be a number but got 'object' instead/,
		);
	}
});

test('no compositionHeight should give errors', () => {
	try {
		render(
			<Player
				compositionWidth={400}
				errorFallback={() => 'something went wrong'}
				// @ts-expect-error
				compositionHeight={undefined}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/'compositionHeight' must be a number but got 'undefined' instead/,
		);
	}
});

test('No fps should give errors', () => {
	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				errorFallback={() => 'something went wrong'}
				// @ts-expect-error
				fps={null}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/"fps" must be a number, but you passed a value of type object/,
		);
	}

	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				errorFallback={() => 'something went wrong'}
				// @ts-expect-error
				fps={undefined}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/"fps" must be a number, but you passed a value of type undefined/,
		);
	}
});

test('No durationInFrames should give errors', () => {
	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				errorFallback={() => 'something went wrong'}
				fps={30}
				// @ts-expect-error
				durationInFrames={undefined}
				component={HelloWorld}
				controls
				showVolumeControls
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/durationInFrames` must be a number, but is undefined/,
		);
	}
});

test('Invalid playbackRate should give error', () => {
	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
				playbackRate={11}
				inputProps={{}}
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/The highest possible playback rate is 10. You passed: 11/,
		);
	}
});

test('playbackRate of 0 should not be possible', () => {
	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
				playbackRate={0}
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/A playback rate of 0 is not supported./,
		);
	}
});

test('playbackRate of wrong type should not be possible', () => {
	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
				// @ts-expect-error
				playbackRate={'hi'}
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/A playback rate of 0 is not supported./,
		);
	}
});

test('playbackRate of undefined should be okay', () => {
	render(
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
		/>,
	);
	expect(true).toBe(true);
});

test('volumePersistenceKey of string should be okay', () => {
	render(
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
			volumePersistenceKey="custom-key"
		/>,
	);
	expect(true).toBe(true);
});

test('initialVolume should be okay', () => {
	render(
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
			initialVolume={0.75}
		/>,
	);
	expect(true).toBe(true);
});

test('muted Player should not create an AudioContext', () => {
	const getCreatedAudioContexts = mockAudioContext();

	render(
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
			initiallyMuted
		/>,
	);

	expect(getCreatedAudioContexts()).toBe(0);
});

test('Player with initialVolume 0 should not create an AudioContext', () => {
	const getCreatedAudioContexts = mockAudioContext();

	render(
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
			initialVolume={0}
		/>,
	);

	expect(getCreatedAudioContexts()).toBe(0);
});

test('Player with audible audio should create an AudioContext', () => {
	const getCreatedAudioContexts = mockAudioContext();

	render(
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
			initialVolume={1}
		/>,
	);

	expect(getCreatedAudioContexts()).toBe(1);
});

test('invalid initialVolume type should give errors', () => {
	expect(() => {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
				// @ts-expect-error
				initialVolume="loud"
			/>,
		);
	}).toThrow(
		/'initialVolume' must be a number or undefined but got 'string' instead/,
	);
});

test('initialVolume out of range should give errors', () => {
	expect(() => {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
				initialVolume={2}
			/>,
		);
	}).toThrow(/'initialVolume' must be between 0 and 1 but got '2' instead/);
});

test('sampleRate should be okay', () => {
	render(
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
			sampleRate={44100}
		/>,
	);
	expect(true).toBe(true);
});

test('sampleRate cannot be changed dynamically', () => {
	const initial = (
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
			sampleRate={44100}
		/>
	);
	const changed = (
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={500}
			component={HelloWorld}
			controls
			showVolumeControls
			sampleRate={48000}
		/>
	);

	const {rerender} = render(initial);

	expect(() => rerender(changed)).toThrow(
		/Changing the AudioContext sample rate dynamically is not supported/,
	);
});

test('invalid sampleRate should give errors', () => {
	expect(() => {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
				sampleRate={0}
			/>,
		);
	}).toThrow(/'sampleRate' must be a positive integer but got '0' instead/);
});

test('passing in <Composition /> instance should not be possible', () => {
	expect(() => {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={Composition}
				controls
				showVolumeControls
				inputProps={{
					id: 'HelloWorld',
					width: 500,
					height: 400,
					fps: 30,
					durationInFrames: 500,
					component: HelloWorld as ComponentType<unknown>,
				}}
			/>,
		);
	}).toThrow(
		/'component' must not be the 'Composition' component\. Pass your own React/,
	);
});
test('passing in <Composition /> instance should not be possible', () => {
	expect(() => {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				// @ts-expect-error
				component={
					<Composition
						durationInFrames={30}
						fps={30}
						height={10}
						width={10}
						id="hello"
						component={HelloWorld}
					/>
				}
				controls
				showVolumeControls
				inputProps={{
					id: 'HelloWorld',
					width: 500,
					height: 400,
					fps: 30,
					durationInFrames: 500,
					component: HelloWorld,
				}}
			/>,
		);
	}).toThrow(
		/'component' should not be an instance of <Composition\/>\. Pass the React component dir/,
	);
});

test.each([
	['controls'],
	['loop'],
	['autoPlay'],
	['showVolumeControls'],
	['allowFullscreen'],
	['clickToPlay'],
	['doubleClickToFullscreen'],
])('No durationInFrames should give errors %s', (a: string) => {
	const props: {[name: string]: string} = {};
	props[a] = 'hey';
	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				errorFallback={() => 'something went wrong'}
				fps={30}
				durationInFrames={100}
				component={HelloWorld}
				{...props}
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			`'${a}' must be a boolean or undefined but got 'string' instead`,
		);
	}
});
