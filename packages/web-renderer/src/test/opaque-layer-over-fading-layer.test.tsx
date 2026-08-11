import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {opaqueLayerOverFadingLayer} from './fixtures/opaque-layer-over-fading-layer';
import {testImage} from './utils';

test('an opaque layer should cover a fading layer', async () => {
	const canvas = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: opaqueLayerOverFadingLayer,
			frame: 0,
			inputProps: {},
		})
	).canvas();
	const context = canvas.getContext('2d');
	const pixel = context?.getImageData(100, 100, 1, 1).data;

	expect(pixel && Array.from(pixel)).toEqual([255, 0, 0, 255]);

	const blob = await canvas.convertToBlob({type: 'image/png'});
	await testImage({blob, testId: 'opaque-layer-over-fading-layer'});
});
