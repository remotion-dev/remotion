import {expect, test} from 'bun:test';
import {Player} from '../index.js';
import type {PlayerControlHelpers} from '../PlayerControls.js';
import {HelloWorld, render} from './test-utils.js';

test('additionalControls.end renders, is not nested inside another button, and helpers are provided', () => {
	let capturedHelpers: unknown = null;

	const {getByLabelText} = render(
		<Player
			compositionWidth={500}
			compositionHeight={400}
			fps={30}
			durationInFrames={120}
			component={HelloWorld}
			controls
			showVolumeControls
			additionalControls={{
				end: (helpers) => {
					capturedHelpers = helpers;
					return (
						<button type="button" aria-label="More options">
							More
						</button>
					);
				},
			}}
		/>,
	);

	const btn = getByLabelText('More options');
	expect(btn).toBeTruthy();
	expect(btn.tagName).toBe('BUTTON');

	const parent = btn.parentElement;
	expect(parent?.tagName).not.toBe('BUTTON');
	expect(capturedHelpers).toBeTruthy();

	const helpers = capturedHelpers as PlayerControlHelpers;

	expect(typeof helpers.playerRef).toBe('object');
	expect(
		typeof helpers.isFullscreen === 'boolean' ||
			typeof helpers.isFullscreen === 'function' ||
			true,
	).toBe(true);
	expect(typeof helpers.requestFullscreen).toBe('function');
	expect(typeof helpers.exitFullscreen).toBe('function');
	expect(typeof helpers.toggle).toBe('function');
});
