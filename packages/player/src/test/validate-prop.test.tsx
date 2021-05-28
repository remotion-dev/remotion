import {Player} from '../index';
import {HelloWorld, render} from './test-utils';

test('no compositionWidth should give errors', () => {
	try {
		render(
			<Player
				// @ts-expect-error
				compositionWidth={null}
				compositionHeight={400}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
			/>
		);
	} catch (e) {
		expect(e.message).toMatch(
			/'compositionWidth' must be a number but got 'object' instead/
		);
	}
});

test('no compositionHeight should give errors', () => {
	try {
		render(
			<Player
				compositionWidth={400}
				// @ts-expect-error
				compositionHeight={undefined}
				fps={30}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
			/>
		);
	} catch (e) {
		expect(e.message).toMatch(
			/'compositionHeight' must be a number but got 'undefined' instead/
		);
	}
});

test('No fps should give errors', () => {
	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				// @ts-expect-error
				fps={null}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
			/>
		);
	} catch (e) {
		expect(e.message).toMatch(
			/"fps" must be a number, but you passed a value of type object/
		);
	}

	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				// @ts-expect-error
				fps={undefined}
				durationInFrames={500}
				component={HelloWorld}
				controls
				showVolumeControls
			/>
		);
	} catch (e) {
		expect(e.message).toMatch(
			/"fps" must be a number, but you passed a value of type undefined/
		);
	}
});

test('No durationInFrames should give errors', () => {
	try {
		render(
			<Player
				compositionWidth={500}
				compositionHeight={400}
				fps={30}
				// @ts-expect-error
				durationInFrames={undefined}
				component={HelloWorld}
				controls
				showVolumeControls
			/>
		);
	} catch (e) {
		expect(e.message).toMatch(
			/The "durationInFrames" of a composition must be a number, but you passed a value of type undefined/
		);
	}
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
				fps={30}
				durationInFrames={100}
				component={HelloWorld}
				{...props}
			/>
		);
	} catch (e) {
		expect(e.message).toMatch(
			`'${a}' must be a boolean or undefined but got 'string' instead`
		);
	}
});
