import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {issue9901RotatedDropShadow} from './fixtures/issue-9901-rotated-drop-shadow';

test('issue-9901 preserves rotation when precompositing a drop-shadow', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: issue9901RotatedDropShadow,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	const image = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(800, 500);
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get 2D context');
	}

	context.drawImage(image, 0, 0);
	image.close();

	// Inside the rotated pill, but outside the axis-aligned client-side result.
	const rotatedPillPixel = context.getImageData(200, 80, 1, 1).data;
	expect(Array.from(rotatedPillPixel)).toEqual([237, 247, 255, 255]);
});
