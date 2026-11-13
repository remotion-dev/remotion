import {expect, test} from 'vitest';
import {calculateTransforms} from '../drawing/calculate-transforms';
import {applySvgFilterToPrecomposedCanvas} from '../drawing/handle-filter';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {filter} from './fixtures/filter';
import {filterContainingBlockReference} from './fixtures/filter-containing-block';
import {
	svgFilterContainingBlockReference,
	svgFilterReference,
	svgFilterExpandedReference,
	svgFilterBoundingBoxReference,
	svgFilterFractionalReference,
	svgFilterOffsetReference,
	svgFilterReviewReference,
} from './fixtures/svg-filter-reference';
import {testCompositions, testImage} from './utils';

test('should render filter', async () => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: filter,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'filter'});
});

test('renders SVG filter regions, offsets and fractional bounds', async (t) => {
	if (
		t.task.file.projectName === 'firefox' ||
		!('filter' in CanvasRenderingContext2D.prototype)
	) {
		t.skip();
		return;
	}

	await testCompositions({
		cases: [
			svgFilterReference,
			svgFilterExpandedReference,
			svgFilterBoundingBoxReference,
			svgFilterFractionalReference,
			svgFilterOffsetReference,
			svgFilterReviewReference,
		].map((composition) => ({composition, frame: 1})),
		columns: 2,
		testId: 'svg-filter-regions',
	});
});

test('SVG filter surfaces release bitmap storage (KINO-7772)', () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML =
		'<filter id="filter-disposal" filterUnits="userSpaceOnUse" x="-2" y="-2" width="14" height="14"><feGaussianBlur stdDeviation="1" /></filter>';
	document.body.append(svg);
	try {
		const source = new OffscreenCanvas(10, 10);
		const layer = applySvgFilterToPrecomposedCanvas({
			source,
			scale: 1,
			sourceRect: new DOMRect(0, 0, 10, 10),
			filter: 'url(#filter-disposal)',
			ownerDocument: document,
		});
		const clone = document.querySelector('[id^="remotion-filter-"]')!;
		expect(clone).not.toBeNull();
		layer![Symbol.dispose]();
		expect(clone.isConnected).toBe(false);
		expect(layer!.canvas.width).toBe(0);
		expect(layer!.canvas.height).toBe(0);
	} finally {
		svg.remove();
	}
});

test('retains CSS and SVG filter containing blocks', async (t) => {
	if (!('filter' in OffscreenCanvasRenderingContext2D.prototype)) {
		t.skip();
		return;
	}

	await testCompositions({
		cases: [
			svgFilterContainingBlockReference,
			filterContainingBlockReference,
		].map((composition) => ({composition, frame: 1})),
		columns: 2,
		testId: 'filter-containing-blocks',
	});
});

// PR #13037: capture must preserve geometry and restore the authored priority.
test('preserves SVG filter containing-block geometry and priority during capture', () => {
	const root = document.createElement('div');
	root.style.cssText = 'position:fixed;left:0;top:0;width:400px;height:200px';
	const parent = document.createElement('div');
	parent.style.cssText = 'margin-left:100px;width:100px;height:80px';
	parent.style.setProperty(
		'filter',
		'url(#containing-block-restore)',
		'important',
	);
	const child = document.createElement('div');
	child.style.cssText =
		'position:absolute;left:10px;top:10px;width:20px;height:20px';
	parent.append(child);
	root.append(parent);
	document.body.append(root);
	const authored = parent.style.getPropertyValue('filter');
	const before = child.getBoundingClientRect().toJSON();
	try {
		{
			using capture = calculateTransforms({
				element: parent,
				rootElement: root,
				transformStyleCache: new WeakMap(),
				isolated: false,
			});
			expect(capture.precompositing.needsFilterPrecompositing).not.toBeNull();
			expect(child.getBoundingClientRect().toJSON()).toEqual(before);
		}

		expect(parent.style.getPropertyValue('filter')).toBe(authored);
		expect(parent.style.getPropertyPriority('filter')).toBe('important');
	} finally {
		root.remove();
	}
});

// PR #13037: capture must preserve geometry and restore the authored priority.
test('preserves filter containing-block geometry and priority during capture', () => {
	const root = document.createElement('div');
	root.style.cssText = 'position:fixed;left:0;top:0;width:400px;height:200px';
	const parent = document.createElement('div');
	parent.style.cssText = 'margin-left:100px;width:100px;height:80px';
	parent.style.setProperty(
		'filter',
		'drop-shadow(0px 0px 0px red)',
		'important',
	);
	const child = document.createElement('div');
	child.style.cssText =
		'position:absolute;left:10px;top:10px;width:20px;height:20px';
	parent.append(child);
	root.append(parent);
	document.body.append(root);
	const authored = parent.style.getPropertyValue('filter');
	const before = child.getBoundingClientRect().toJSON();
	try {
		{
			using capture = calculateTransforms({
				element: parent,
				rootElement: root,
				transformStyleCache: new WeakMap(),
				isolated: false,
			});
			expect(capture.precompositing.needsFilterPrecompositing).not.toBeNull();
			expect(child.getBoundingClientRect().toJSON()).toEqual(before);
		}

		expect(parent.style.getPropertyValue('filter')).toBe(authored);
		expect(parent.style.getPropertyPriority('filter')).toBe('important');
	} finally {
		root.remove();
	}
});
