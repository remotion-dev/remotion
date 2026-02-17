import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {border} from './fixtures/border';
import {borderIndividualSides} from './fixtures/border-individual-sides';
import {testImage} from './utils';

test('should render border', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: border,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'border'});
});

test('should render border with different styles for each side', async () => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: borderIndividualSides,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'border-individual-sides'});
});
