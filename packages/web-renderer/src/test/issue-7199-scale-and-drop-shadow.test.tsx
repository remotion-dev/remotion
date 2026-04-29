import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue7199ScaleAndDropShadow} from './fixtures/issue-7199-scale-and-drop-shadow';
import {testImage} from './utils';

// Regression: https://github.com/remotion-dev/remotion/issues/7199
test('issue-7199 ancestor scale with drop-shadow precompose', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue7199ScaleAndDropShadow,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'issue-7199-scale-and-drop-shadow'});
});
