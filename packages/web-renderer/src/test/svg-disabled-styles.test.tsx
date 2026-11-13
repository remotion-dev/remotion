import {expect, test} from 'vitest';
import '../symbol-dispose';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {renderStillOnWeb} from '../render-still-on-web';
import {
	svgDisabledStyles,
	svgDisabledStylesOpaque,
} from './fixtures/svg-disabled-styles';
import {captureNativeReference, compareNativePixels} from './native-reference';

for (const fixture of [svgDisabledStyles, svgDisabledStylesOpaque]) {
	for (const frame of [0, 1]) {
		test(`${fixture.id} preserves stylesheet state at frame ${frame}`, async (t) => {
			const opaque = fixture === svgDisabledStylesOpaque;
			if (t.task.file.projectName === 'firefox' && !opaque) {
				t.skip();
				return;
			}

			const reference = await captureNativeReference(fixture, frame, {
				omitBackground: !opaque,
			});
			const actual = await (
				await renderStillOnWeb({
					licenseKey: 'free-license',
					composition: fixture,
					frame,
					inputProps: {},
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			const diff = await compareNativePixels(reference, actual);

			expect(diff.mismatchedPixels).toBe(0);
		});
	}
}

test('refreshes a reused SVG drawable when its stylesheet toggles without changing the authored sheet', async () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '24');
	svg.setAttribute('height', '24');
	svg.innerHTML =
		'<style>.disabled-cache-rect {fill:red}</style><rect class="disabled-cache-rect" fill="blue" width="24" height="24" />';
	document.body.appendChild(svg);
	try {
		const style = svg.querySelector('style')!;
		const sheet = style.sheet!;
		const originalText = style.textContent;
		const canvas = new OffscreenCanvas(24, 24);
		const context = canvas.getContext('2d')!;
		for (const disabled of [true, false, true]) {
			sheet.disabled = disabled;
			context.clearRect(0, 0, 24, 24);
			context.drawImage(await turnSvgIntoDrawable(svg), 0, 0);
			expect(Array.from(context.getImageData(12, 12, 1, 1).data)).toEqual(
				disabled ? [0, 0, 255, 255] : [255, 0, 0, 255],
			);
			expect(svg.querySelector('style')).toBe(style);
			expect(style.sheet).toBe(sheet);
			expect(sheet.disabled).toBe(disabled);
			expect(style.textContent).toBe(originalText);
		}
	} finally {
		svg.remove();
	}
});
