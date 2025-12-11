import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {border} from './fixtures/border';
import {testImage} from './utils';

test('should render border', async () => {
	const blob = await renderStillOnWeb({
		composition: border,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'border'});
});
