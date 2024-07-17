import {expect, test} from 'bun:test';
import type {ComponentType} from 'react';
import {Composition} from 'remotion';
import {Player} from '../index.js';
import {HelloWorld, render} from './test-utils.js';

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
				playbackRate={-5}
				inputProps={{}}
			/>,
		);
	} catch (e) {
		expect((e as Error).message).toMatch(
			/The lowest possible playback rate is -4. You passed: -5/,
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
