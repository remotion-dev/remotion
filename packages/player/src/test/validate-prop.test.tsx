import {Player} from '../index';
import {HelloWorld, render} from './test-utils';

test('no durationInFrames should give errors', () => {
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
