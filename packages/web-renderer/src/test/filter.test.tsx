import {expect} from 'vitest';
import {test} from 'vitest';
import {calculateTransforms} from '../drawing/calculate-transforms';
import {renderStillOnWeb} from '../render-still-on-web';
import {filter} from './fixtures/filter';
import {filterContainingBlockReference} from './fixtures/filter-containing-block';
import '../symbol-dispose';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';
import {testImage} from './utils';

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

// PR #13037: neutralizing filter must preserve absolute and fixed containing blocks.
for (const frame of [0, 1]) {
	test(`retains filter containing blocks at frame ${frame}`, async (t) => {
		if (!('filter' in OffscreenCanvasRenderingContext2D.prototype)) {
			t.skip();
			return;
		}

		const reference = await captureNativeReference(
			filterContainingBlockReference,
			frame,
			{omitBackground: false},
		);
		const actual = await (
			await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: filterContainingBlockReference,
				frame,
				inputProps: {},
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const diff = await compareNativePixels(reference, actual);
		if (diff.mismatchedPixels !== 0)
			await Promise.all([
				savePixelEvidence(
					reference,
					`filter-containing-block-${frame}-native`,
					{omitBackground: false},
				),
				savePixelEvidence(actual, `filter-containing-block-${frame}-actual`, {
					omitBackground: false,
				}),
				savePixelEvidence(diff.diff, `filter-containing-block-${frame}-diff`, {
					omitBackground: false,
				}),
			]);
		expect(diff.mismatchedPixels).toBe(0);
	});
}

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
