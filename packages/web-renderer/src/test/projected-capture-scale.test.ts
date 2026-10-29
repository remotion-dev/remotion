import {expect, test} from 'vitest';
import {getProjectedCaptureScale as captureScale} from '../drawing/transform-rect-with-matrix';
const base = {
	scale: 1,
	sourceWidth: 200,
	sourceHeight: 100,
	projectedWidth: 400,
	projectedHeight: 200,
};
test('magnification increases density without reducing caller scale', () => {
	expect(captureScale(base)).toBe(2);
	expect(captureScale({...base, scale: 2})).toBe(4);
	expect(
		captureScale({...base, projectedWidth: 100, projectedHeight: 50}),
	).toBe(1);
});
test('rounded sampling allocations respect both edge and pixel budgets', () => {
	const input = {
		...base,
		sourceWidth: 202.1,
		sourceHeight: 68.7,
		projectedWidth: 6000,
		projectedHeight: 4000,
	};
	const scale = captureScale(input);
	const width = Math.ceil(input.sourceWidth * scale);
	const height = Math.ceil(input.sourceHeight * scale);
	expect(scale).toBeGreaterThan(1);
	expect(width).toBeLessThanOrEqual(8192);
	expect(height).toBeLessThanOrEqual(8192);
	expect(width * height).toBeLessThanOrEqual(16777216);
	expect(
		captureScale({
			...base,
			sourceWidth: 10000,
			sourceHeight: 10000,
			projectedWidth: 20000,
			projectedHeight: 20000,
		}),
	).toBe(1);
});
test('degenerate projection does not poison the caller scale', () => {
	expect(captureScale({...base, projectedWidth: Infinity})).toBe(1);
	expect(captureScale({...base, sourceWidth: 0})).toBe(1);
});
