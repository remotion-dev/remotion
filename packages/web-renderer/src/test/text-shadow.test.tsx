import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {textShadow} from './fixtures/text/text-shadow';
import {testImage} from './utils';

test('should render text-shadow', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: textShadow,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'text-shadow', threshold: 0.01});
});
