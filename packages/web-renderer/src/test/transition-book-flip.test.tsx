import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {transitionBookFlip} from './fixtures/transition-book-flip';
import {testImage} from './utils';

test('bookFlip transition renders correctly', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: transitionBookFlip,
			frame: 15,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'transition-book-flip'});
});
