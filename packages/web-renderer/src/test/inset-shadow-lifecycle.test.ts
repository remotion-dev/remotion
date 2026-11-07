import {afterEach, expect, test, vi} from 'vitest';
import {parseBorderRadius} from '../drawing/border-radius';
import {drawBorderRadius} from '../drawing/draw-box-shadow';

const Canvas = OffscreenCanvas;
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

test.each([false, true])(
	'releases the blurred inset surface after drawing (throws: %s)',
	(fail) => {
		const context = new Canvas(400, 250).getContext('2d')!;
		const allocated: OffscreenCanvas[] = [];
		vi.stubGlobal(
			'OffscreenCanvas',
			class extends Canvas {
				constructor(width: number, height: number) {
					super(width, height);
					allocated.push(this);
				}
			},
		);
		const restore = vi.spyOn(context, 'restore');
		const draw = vi.spyOn(context, 'drawImage');
		if (fail)
			draw.mockImplementation(() => {
				throw new Error('draw failed');
			});
		const element = document.createElement('div');
		element.style.cssText =
			'box-shadow: inset 0 0 24px #000; border: 0; border-radius: 35px';
		document.body.appendChild(element);
		try {
			const render = () =>
				drawBorderRadius({
					ctx: context,
					rect: new DOMRect(0, 0, 400, 250),
					borderRadius: parseBorderRadius({
						borderRadius: '35px',
						width: 400,
						height: 250,
					}),
					computedStyle: getComputedStyle(element),
					logLevel: 'error',
					inset: true,
				});
			if (fail) expect(render).toThrow('draw failed');
			else render();
			expect(draw).toHaveBeenCalledOnce();
			expect(allocated).toHaveLength(1);
			expect(allocated[0].width).toBe(0);
			expect(allocated[0].height).toBe(0);
			expect(restore).toHaveBeenCalledOnce();
		} finally {
			element.remove();
		}
	},
);

test('rejects an oversized inset shadow before allocating its surface', () => {
	const context = new Canvas(400, 250).getContext('2d')!;
	const allocate = vi.fn();
	vi.stubGlobal(
		'OffscreenCanvas',
		class extends Canvas {
			constructor(width: number, height: number) {
				super(width, height);
				allocate();
			}
		},
	);
	const restore = vi.spyOn(context, 'restore');
	const element = document.createElement('div');
	element.style.cssText = 'box-shadow: inset 0 0 24px #000; border: 0';
	document.body.appendChild(element);
	try {
		drawBorderRadius({
			ctx: context,
			rect: new DOMRect(0, 0, 100000, 250),
			borderRadius: parseBorderRadius({
				borderRadius: '0',
				width: 100000,
				height: 250,
			}),
			computedStyle: getComputedStyle(element),
			logLevel: 'error',
			inset: true,
		});
		expect(allocate).not.toHaveBeenCalled();
		expect(restore).toHaveBeenCalledOnce();
	} finally {
		element.remove();
	}
});
