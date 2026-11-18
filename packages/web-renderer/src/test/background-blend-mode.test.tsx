import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {backgroundBlendMode} from './fixtures/background-blend-mode';
import {testImage} from './utils';

test.skipIf(!navigator.userAgent.includes('Chrome'))(
	'blends backgrounds without blending descendants or the backdrop',
	async () => {
		await page.viewport(backgroundBlendMode.width, backgroundBlendMode.height);
		const still = await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: backgroundBlendMode,
			frame: 1,
			inputProps: {},
			allowHtmlInCanvas: false,
		});
		await testImage({
			blob: await still.blob({format: 'png'}),
			testId: 'background-blend-mode',
		});
	},
);
