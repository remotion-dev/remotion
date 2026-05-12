import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {filterLineHeightClip} from './fixtures/text/filter-line-height-clip';
import {testImage} from './utils';

test('should render filter-line-height-clip', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: filterLineHeightClip,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'filter-line-height-clip'});
});
