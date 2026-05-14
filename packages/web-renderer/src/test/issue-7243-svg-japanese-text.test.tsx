import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue7243SvgJapaneseText} from './fixtures/issue-7243-svg-japanese-text';
import {testImage} from './utils';

test('issue #7243: SVG with Japanese text serializes to Unicode and must rasterize', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue7243SvgJapaneseText,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'issue-7243-svg-japanese-text'});
});
