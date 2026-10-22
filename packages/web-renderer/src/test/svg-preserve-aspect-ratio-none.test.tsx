import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {svgPreserveAspectRatioNone} from './fixtures/svg-preserve-aspect-ratio-none';
import {testImage} from './utils';

test('renders SVGs without size attributes with preserveAspectRatio="none" (issue #12095)', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: svgPreserveAspectRatioNone,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'svg-preserve-aspect-ratio-none'});
});
