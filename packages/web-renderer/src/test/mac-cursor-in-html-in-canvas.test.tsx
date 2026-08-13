import {expect, test} from 'vitest';
import {supportsNativeHtmlInCanvas} from '../html-in-canvas';
import {renderMediaOnWeb} from '../render-media-on-web';
import '../symbol-dispose';
import {macCursorInHtmlInCanvas} from './fixtures/mac-cursor-in-html-in-canvas';

test('renders a macOS cursor inside an effected HtmlInCanvas', async () => {
	if (!supportsNativeHtmlInCanvas()) {
		return;
	}

	const visibleCursorPixels: number[] = [];
	await renderMediaOnWeb({
		composition: macCursorInHtmlInCanvas,
		inputProps: {},
		licenseKey: 'free-license',
		muted: true,
		onFrame: (frame) => {
			const canvas = new OffscreenCanvas(200, 200);
			const context = canvas.getContext('2d');
			if (!context) {
				throw new Error('Could not get canvas context');
			}

			context.drawImage(frame, 0, 0);
			const pixels = context.getImageData(0, 0, 200, 200).data;
			let whitePixels = 0;
			for (let index = 0; index < pixels.length; index += 4) {
				if (
					pixels[index] > 150 &&
					pixels[index + 1] > 150 &&
					pixels[index + 2] > 150
				) {
					whitePixels++;
				}
			}

			visibleCursorPixels.push(whitePixels);
			return frame;
		},
	});

	expect(visibleCursorPixels).toHaveLength(3);
	expect(visibleCursorPixels.every((pixels) => pixels > 10)).toBe(true);
});
