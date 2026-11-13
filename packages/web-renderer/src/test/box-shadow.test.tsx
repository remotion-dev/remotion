import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {boxShadow} from './fixtures/box-shadow';
import {
	boxShadowSpreadInset,
	boxShadowSpreadInsetAlpha,
	boxShadowInsetReview,
	boxShadowInsetContentClip,
} from './fixtures/box-shadow-spread-inset';
import {testCompositions, testImage} from './utils';

test('should render box-shadow', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: boxShadow,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'box-shadow', threshold: 0.01});
});

test('renders spread, inset, alpha and content-clip shadows', async () => {
	await testCompositions({
		cases: [
			boxShadowSpreadInset,
			boxShadowSpreadInsetAlpha,
			boxShadowInsetReview,
			boxShadowInsetContentClip,
		].map((composition) => ({composition, frame: 1})),
		columns: 2,
		testId: 'box-shadow-spread-inset',
		scale: null,
	});
});
