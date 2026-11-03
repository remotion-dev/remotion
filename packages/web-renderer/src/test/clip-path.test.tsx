import {expect, test} from 'vitest';
import {parseClipPath} from '../drawing/clip-path';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {clipPathCircle} from './fixtures/clip-path-circle';
import {clipPathEllipse} from './fixtures/clip-path-ellipse';
import {clipPathInset} from './fixtures/clip-path-inset';
import {clipPathPath} from './fixtures/clip-path-path';
import {clipPathPolygon} from './fixtures/clip-path-polygon';
import {testImage} from './utils';

test('Should render clip-path: polygon()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathPolygon,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-polygon',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clip-path: path()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathPath,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-path',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clip-path: circle()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathCircle,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-circle',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clip-path: inset()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathInset,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-inset',
		allowedMismatchedPixelRatio: 0.02,
	});
});

test('Should render clip-path: ellipse()', async () => {
	const still = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: clipPathEllipse,
		frame: 0,
		inputProps: {},
	});
	const blob = await still.blob({format: 'png'});

	await testImage({
		blob,
		testId: 'clip-path-ellipse',
		allowedMismatchedPixelRatio: 0.02,
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

test.each(['evenodd', 'nonzero', null] as const)(
	'Should render a JPEG polygon with fill rule %s',
	async (fillRule) => {
		const points =
			'10% 10%, 90% 10%, 90% 90%, 10% 90%, 10% 10%, 30% 30%, 70% 30%, 70% 70%, 30% 70%, 30% 30%';
		const clipPath = `polygon(${fillRule ? `${fillRule}, ` : ''}${points})`;
		const component = () => (
			<div style={{width: 200, height: 200, backgroundColor: 'white'}}>
				<div
					style={{width: 200, height: 200, backgroundColor: 'red', clipPath}}
				/>
			</div>
		);
		const still = await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {...clipPathPolygon, component},
			frame: 0,
			inputProps: {},
			allowHtmlInCanvas: false,
		});
		const blob = await still.blob({format: 'jpeg', quality: 1});
		const bitmap = await createImageBitmap(blob);
		const canvas = new OffscreenCanvas(200, 200);
		const ctx = canvas.getContext('2d')!;
		ctx.drawImage(bitmap, 0, 0);
		bitmap.close();
		const center = [...ctx.getImageData(100, 100, 1, 1).data];
		const ring = [...ctx.getImageData(40, 100, 1, 1).data];
		expect(blob.type).toBe('image/jpeg');
		expect(center[0]).toBeGreaterThan(250);
		for (const channel of center.slice(1, 3)) {
			if (fillRule === 'evenodd') {
				expect(channel).toBeGreaterThan(250);
			} else {
				expect(channel).toBeLessThan(5);
			}
		}

		expect(ring[0]).toBeGreaterThan(250);
		expect(ring[1]).toBeLessThan(5);
		expect(ring[2]).toBeLessThan(5);
	},
);
