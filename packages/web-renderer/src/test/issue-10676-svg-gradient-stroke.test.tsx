import {test} from 'vitest';
import {page} from 'vitest/browser';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue10676SvgGradientStroke} from './fixtures/issue-10676-svg-gradient-stroke';
import {testImage} from './utils';

test('preserves SVG gradient strokes in still and media renders', async (t) => {
	const frameToTest = 80;
	await page.viewport(320, 180);
	const still = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue10676SvgGradientStroke,
			frame: frameToTest,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({
		blob: still,
		testId: 'issue-10676-svg-gradient-stroke-still',
		threshold: 0.02,
	});

	if (t.task.file.projectName === 'webkit') {
		return;
	}

	let mediaFrame: Blob | null = null;
	let renderedFrameCount = 0;
	await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: issue10676SvgGradientStroke,
		inputProps: {},
		frameRange: [0, frameToTest],
		onFrame: async (frame) => {
			renderedFrameCount++;
			if (renderedFrameCount !== frameToTest + 1) {
				return frame;
			}

			const canvas = new OffscreenCanvas(320, 180);
			const context = canvas.getContext('2d');
			if (!context) {
				throw new Error('Could not create 2D context');
			}

			context.drawImage(frame, 0, 0);
			mediaFrame = await canvas.convertToBlob({type: 'image/png'});
			return frame;
		},
	});

	if (!mediaFrame) {
		throw new Error('Expected renderMediaOnWeb() to produce a frame');
	}

	await testImage({
		blob: mediaFrame,
		testId: 'issue-10676-svg-gradient-stroke-media',
		threshold: 0.02,
	});
});
