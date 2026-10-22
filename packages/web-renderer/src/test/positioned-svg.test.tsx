import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {positionedSvg} from './fixtures/positioned-svg';
import {testImage} from './utils';

test('renders an absolutely positioned and transformed SVG', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: positionedSvg,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});
	await testImage({blob, testId: 'positioned-svg'});
});
