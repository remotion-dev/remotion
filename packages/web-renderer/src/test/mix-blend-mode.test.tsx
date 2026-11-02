import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	blendModes,
	blendModesBackdrop,
	blendModesSource,
	mixBlendModeAllModes,
	mixBlendModeGroups,
} from './fixtures/mix-blend-mode';

const getPixel = (
	context: OffscreenCanvasRenderingContext2D | null,
	x: number,
	y: number,
) => {
	return Array.from(context!.getImageData(x, y, 1, 1).data);
};

const expectPixel = (actual: number[], expected: number[]) => {
	for (let i = 0; i < 4; i++) {
		expect(Math.abs(actual[i] - expected[i])).toBeLessThanOrEqual(2);
	}
};

test('should apply every mix-blend-mode', async () => {
	const canvas = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: mixBlendModeAllModes,
			frame: 0,
			inputProps: {},
		})
	).canvas();
	const context = canvas.getContext('2d');

	for (let i = 0; i < blendModes.length; i++) {
		const reference = new OffscreenCanvas(1, 1).getContext('2d')!;
		reference.fillStyle = blendModesBackdrop;
		reference.fillRect(0, 0, 1, 1);
		reference.globalCompositeOperation = blendModes[i];
		reference.fillStyle = blendModesSource;
		reference.fillRect(0, 0, 1, 1);

		expectPixel(getPixel(context, i * 40 + 20, 20), getPixel(reference, 0, 0));
	}
});

test('should blend groups and respect isolation', async () => {
	const canvas = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: mixBlendModeGroups,
			frame: 0,
			inputProps: {},
		})
	).canvas();
	const context = canvas.getContext('2d');

	// red multiplied with gray
	expectPixel(getPixel(context, 50, 50), [128, 0, 0, 255]);
	// yellow multiplied with gray
	expectPixel(getPixel(context, 150, 25), [128, 128, 0, 255]);
	// cyan child multiplied with gray, not with its yellow parent
	expectPixel(getPixel(context, 150, 75), [0, 128, 128, 255]);
	// isolation: isolate
	expectPixel(getPixel(context, 250, 50), [255, 0, 0, 255]);
	// red multiplied with white inside the group, then faded over gray
	expectPixel(getPixel(context, 350, 50), [191, 64, 64, 255]);
	// transform
	expectPixel(getPixel(context, 450, 50), [255, 0, 0, 255]);
	// no stacking context, blends with the backdrop
	expectPixel(getPixel(context, 550, 50), [128, 0, 0, 255]);
	// red screened with gray
	expectPixel(getPixel(context, 650, 50), [255, 128, 128, 255]);
});
