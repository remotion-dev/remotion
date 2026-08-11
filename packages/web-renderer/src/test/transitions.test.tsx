import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {transitionClockWipe} from './fixtures/transition-clock-wipe';
import {transitionIris} from './fixtures/transition-iris';
import {transitionWipe} from './fixtures/transition-wipe';
import {testImage} from './utils';

test('Should render wipe transition', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: transitionWipe,
		frame: 35,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'transition-wipe',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clock-wipe transition', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: transitionClockWipe,
		frame: 35,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'transition-clock-wipe',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render iris transition', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: transitionIris,
		frame: 35,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'transition-iris',
		allowedMismatchedPixelRatio: 0.02,
	});
});
