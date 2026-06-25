import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue8650SvgControlCharacter} from './fixtures/issue-8650-svg-control-character';
import {testImage} from './utils';

test('issue #8650: SVG attributes with control characters must rasterize', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue8650SvgControlCharacter,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'issue-8650-svg-control-character'});
});
