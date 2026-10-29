import {expect, test, vi} from 'vitest';
import {
	drawWithHtmlInCanvas,
	type HtmlInCanvasContext,
} from '../html-in-canvas';

for (const stage of ['before request', 'waiting for paint', 'after paint']) {
	test(`cancels native capture ${stage} and releases paint resources`, async () => {
		vi.useFakeTimers();
		try {
			const layoutCanvas = Object.assign(new EventTarget(), {
				width: 1,
				height: 1,
				requestPaint: vi.fn(),
			});
			const removePaint = vi.spyOn(layoutCanvas, 'removeEventListener');
			const controller = new AbortController();
			const removeAbort = vi.spyOn(controller.signal, 'removeEventListener');
			const reason = new Error('capture cancelled');
			const reset = vi.fn();
			const drawElementImage = vi.fn();
			if (stage === 'before request') {
				controller.abort(reason);
			}

			const capture = drawWithHtmlInCanvas({
				htmlInCanvasContext: {
					layoutCanvas,
					ctx: {reset, drawElementImage},
					wasDrawable: false,
				} as unknown as HtmlInCanvasContext,
				element: {} as HTMLElement,
				scaledWidth: 1,
				scaledHeight: 1,
				signal: controller.signal,
			});
			// Attach the rejection handler before cancelling or flushing timers.
			const rejected = expect(capture).rejects.toBe(reason);
			if (stage === 'after paint') {
				layoutCanvas.dispatchEvent(new Event('paint'));
			}

			controller.abort(reason);
			await vi.runAllTimersAsync();
			await rejected;
			expect(removePaint).toHaveBeenCalledWith('paint', expect.any(Function));
			expect(removeAbort).toHaveBeenCalledWith('abort', expect.any(Function));
			expect(vi.getTimerCount()).toBe(0);
			expect(reset).not.toHaveBeenCalled();
			expect(drawElementImage).not.toHaveBeenCalled();
			expect(layoutCanvas.requestPaint).toHaveBeenCalledTimes(
				stage === 'before request' ? 0 : 1,
			);
		} finally {
			vi.useRealTimers();
		}
	});
}

test('removes native paint and abort listeners if requestPaint throws', async () => {
	const reason = new Error('requestPaint failed');
	const layoutCanvas = Object.assign(new EventTarget(), {
		width: 1,
		height: 1,
		requestPaint: () => {
			throw reason;
		},
	});
	const controller = new AbortController();
	const removePaint = vi.spyOn(layoutCanvas, 'removeEventListener');
	const removeAbort = vi.spyOn(controller.signal, 'removeEventListener');
	await expect(
		drawWithHtmlInCanvas({
			htmlInCanvasContext: {
				layoutCanvas,
				ctx: {},
				wasDrawable: false,
			} as unknown as HtmlInCanvasContext,
			element: {} as HTMLElement,
			scaledWidth: 1,
			scaledHeight: 1,
			signal: controller.signal,
		}),
	).rejects.toBe(reason);
	expect(removePaint).toHaveBeenCalledWith('paint', expect.any(Function));
	expect(removeAbort).toHaveBeenCalledWith('abort', expect.any(Function));
});
