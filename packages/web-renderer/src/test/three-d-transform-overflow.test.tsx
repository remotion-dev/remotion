import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {threeDoverflow} from './fixtures/three-d-overflow';
import {testImage} from './utils';

test('Should combine transform property with scale shorthand', async () => {
	const blob = await renderStillOnWeb({
		composition: threeDoverflow,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'three-d-overflow'});
});
