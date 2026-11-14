import {expect, test, vi} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import {gradientPaintContext} from './fixtures/gradient-paint-context';
import '../symbol-dispose';
test.for(['throw', 'null'] as const)(
	'releases the background source when pattern creation returns $0',
	async (mode) => {
		const sources: OffscreenCanvas[] = [];
		const original = OffscreenCanvasRenderingContext2D.prototype.createPattern;
		const spy = vi
			.spyOn(OffscreenCanvasRenderingContext2D.prototype, 'createPattern')
			.mockImplementation(
				function (this: OffscreenCanvasRenderingContext2D, source, repeat) {
					if (this.globalAlpha !== 1 && source instanceof OffscreenCanvas) {
						sources.push(source);
						if (mode === 'throw')
							throw new Error('Pattern creation unavailable');
						return null;
					}

					return original.call(this, source, repeat);
				},
			);
		try {
			await expect(
				renderStillOnWeb({
					composition: gradientPaintContext('opacity'),
					frame: 0,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				}),
			).rejects.toThrow(
				mode === 'throw'
					? 'Pattern creation unavailable'
					: 'Could not create background compositing pattern',
			);
			expect(sources).toHaveLength(1);
			expect(sources[0].width).toBe(0);
			expect(sources[0].height).toBe(0);
		} finally {
			spy.mockRestore();
		}
	},
);
