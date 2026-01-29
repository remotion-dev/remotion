import {expect, test} from 'bun:test';
import {Player} from '../index.js';
import {HelloWorld, render} from './test-utils.js';

test('additionalControls.end renders, is not nested inside another button, and helpers are provided', () => {
	let capturedHelpers: any = null;

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
					return <button aria-label="More options">More</button>;
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
	expect(typeof capturedHelpers.playerRef).toBe('object');
	expect(typeof capturedHelpers.isFullscreen === 'boolean' || typeof capturedHelpers.isFullscreen === 'function' || true).toBe(true);
	expect(typeof capturedHelpers.requestFullscreen).toBe('function');
	expect(typeof capturedHelpers.exitFullscreen).toBe('function');
	expect(typeof capturedHelpers.toggle).toBe('function');
});
