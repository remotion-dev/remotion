import {expect, test} from 'vitest';
import {page} from 'vitest/browser';
import {calculateTransforms} from '../drawing/calculate-transforms';
import {parseClipPath} from '../drawing/clip-path';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {clipPathShapes, clipPathReferences} from './fixtures/clip-path';
import {clipPathDescendantFilterObjectBox} from './fixtures/clip-path-descendant-filter';
import {clipPathPolygonFillRules} from './fixtures/clip-path-polygon-fill-rules';
import {clipPathRectangleDescendantFilter} from './fixtures/clip-path-rectangle-descendant-filter';
import {clipScaledFilter} from './fixtures/clip-path-rectangle-union';
import {testCompositions, testImage} from './utils';

test.for([clipPathShapes, clipPathReferences])(
	'renders $id',
	async (composition) => {
		await page.viewport(composition.width, composition.height);
		const still = await renderStillOnWeb({
			composition,
			frame: composition.durationInFrames - 1,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		});
		await testImage({
			blob: await still.blob({format: 'png'}),
			testId: composition.id,
		});
	},
);

test('preserves descendant filter paint through referenced clips', async (t) => {
	if (!('filter' in OffscreenCanvasRenderingContext2D.prototype)) {
		t.skip();
		return;
	}

	await testCompositions({
		scale: null,
		cases: [
			clipPathDescendantFilterObjectBox,
			clipPathRectangleDescendantFilter,
			clipScaledFilter,
		].map((composition) => ({composition, frame: 1})),
		columns: 3,
		testId: 'clip-path-descendant-filters',
	});
});

// A fill-rule prefix must not be parsed as a coordinate pair.
test.each(['evenodd', 'nonzero'] as const)(
	'Should parse a polygon with the %s fill rule',
	(fillRule) => {
		expect(
			parseClipPath(
				`polygon(${fillRule}, 0% 0%, 100% 0%, 50% 100%)`,
				new DOMRect(10, 20, 200, 100),
			),
		).toEqual({
			type: 'polygon',
			fillRule,
			points: [
				{x: 10, y: 20},
				{x: 210, y: 20},
				{x: 110, y: 120},
			],
		});
	},
);

// Regression for remotion-dev/remotion#12928.
test('Should render polygon fill rules', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathPolygonFillRules,
		frame: 0,
		inputProps: {},
		allowHtmlInCanvas: false,
	});
	const blob = await still.blob({format: 'png'});

	await testImage({blob, testId: clipPathPolygonFillRules.id});
});

test('restores inline group properties and important priorities after clipping', () => {
	const host = document.createElement('div');
	host.innerHTML =
		'<style>.priority-group {clip-path: url(#priority-clip) !important; opacity: .5 !important}</style><svg width="0" height="0"><defs><clipPath id="priority-clip"><rect width="20" height="20" /></clipPath></defs></svg><div></div>';
	const element = host.lastElementChild as HTMLDivElement;
	element.className = 'priority-group';
	const properties = [
		['mix-blend-mode', 'multiply'],
		['filter', 'opacity(.5)'],
		['mask-image', 'linear-gradient(black, black)'],
	] as const;
	for (const [property, value] of properties) {
		element.style.setProperty(property, value, 'important');
	}

	const before = [
		...properties.map(([property]) => property),
		'clip-path',
		'opacity',
	].map((property) => [
		property,
		element.style.getPropertyValue(property),
		element.style.getPropertyPriority(property),
	]);
	document.body.appendChild(host);
	try {
		const transforms = calculateTransforms({
			element,
			rootElement: element,
			transformStyleCache: new WeakMap(),
			isolated: true,
			experimental3DRendering: null,
		});
		try {
			const style = getComputedStyle(element);
			expect(style.clipPath).toBe('none');
			expect(style.opacity).toBe('1');
			expect(style.filter).toBe('opacity(1)');
			expect(style.mixBlendMode).toBe('normal');
			expect(style.maskImage).toBe('none');
		} finally {
			transforms[Symbol.dispose]();
		}

		for (const [property, value, priority] of before) {
			expect(element.style.getPropertyValue(property)).toBe(value);
			expect(element.style.getPropertyPriority(property)).toBe(priority);
		}
	} finally {
		host.remove();
	}
});

test('restores multi-rectangle clip group properties and important priorities (KINO-7772)', () => {
	const host = document.createElement('div');
	host.innerHTML =
		'<style>.priority-group {clip-path: url(#union-priority-clip) !important; opacity: .5 !important}</style><svg width="0" height="0"><defs><clipPath id="union-priority-clip"><rect width="10" height="20" /><rect x="10" width="10" height="20" /></clipPath></defs></svg><div></div>';
	const element = host.lastElementChild as HTMLDivElement;
	element.className = 'priority-group';
	const properties = [
		['mix-blend-mode', 'multiply'],
		['filter', 'opacity(.5)'],
		['mask-image', 'linear-gradient(black, black)'],
	] as const;
	for (const [property, value] of properties) {
		element.style.setProperty(property, value, 'important');
	}

	const before = [
		...properties.map(([property]) => property),
		'clip-path',
		'opacity',
	].map((property) => [
		property,
		element.style.getPropertyValue(property),
		element.style.getPropertyPriority(property),
	]);
	document.body.appendChild(host);
	try {
		const transforms = calculateTransforms({
			element,
			rootElement: element,
			transformStyleCache: new WeakMap(),
			isolated: true,
			experimental3DRendering: null,
		});
		try {
			const style = getComputedStyle(element);
			expect(style.clipPath).toBe('none');
			expect(style.opacity).toBe('1');
			expect(style.filter).toBe('opacity(1)');
			expect(style.mixBlendMode).toBe('normal');
			expect(style.maskImage).toBe('none');
		} finally {
			transforms[Symbol.dispose]();
		}

		for (const [property, value, priority] of before) {
			expect(element.style.getPropertyValue(property)).toBe(value);
			expect(element.style.getPropertyPriority(property)).toBe(priority);
		}
	} finally {
		host.remove();
	}
});
