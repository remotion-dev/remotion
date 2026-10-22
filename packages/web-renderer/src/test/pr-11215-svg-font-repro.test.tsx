import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	pr11215FontPromise,
	pr11215SvgFontRepro,
} from './fixtures/pr-11215-svg-font-repro';
import {testImage} from './utils';

test('PR #11215: embeds a font loaded through @remotion/fonts into SVG text', async () => {
	await pr11215FontPromise;

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: pr11215SvgFontRepro,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'pr-11215-svg-font-repro'});
});
