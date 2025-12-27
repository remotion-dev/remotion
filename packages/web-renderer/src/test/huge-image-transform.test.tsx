import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {hugeImageTransform} from './fixtures/huge-image-transform';
import {testImage} from './utils';

test('should render huge image with scale and 3D transform', async () => {
	const blob = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: hugeImageTransform,
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	await testImage({blob, testId: 'huge-image-transform'});
});
