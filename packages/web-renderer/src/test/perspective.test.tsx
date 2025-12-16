import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {perspectiveNested} from './fixtures/perspective-nested';
import {perspectiveOrigin} from './fixtures/perspective-origin';
import {perspectiveSimple} from './fixtures/perspective-simple';
import {testImage} from './utils';

test('should apply simple perspective with rotateY', async () => {
	const blob = await renderStillOnWeb({
		composition: perspectiveSimple,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'perspective-simple'});
});

test('should apply nested perspective (parent perspective with nested transforms)', async () => {
	const blob = await renderStillOnWeb({
		composition: perspectiveNested,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'perspective-nested'});
});

test('should apply perspective-origin', async () => {
	const blob = await renderStillOnWeb({
		composition: perspectiveOrigin,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'perspective-origin'});
});
