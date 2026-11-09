import {AbsoluteFill} from 'remotion';
import {expect, test} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {backgroundImageUrl} from './fixtures/background-image-url';
import {backgroundImageContain} from './fixtures/background-image-url-contain';
import {
	backgroundImagePixelated,
	pixelatedRaster,
} from './fixtures/background-image-url-pixelated';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';
import {testImage} from './utils';

test
	.skipIf(!navigator.userAgent.includes('Chrome'))
	.each(
		[
			backgroundImageUrl,
			backgroundImageContain,
			backgroundImagePixelated,
		].flatMap((fixture) => [0, 1].map((frame) => ({fixture, frame}))),
	)(
	'raster $fixture.id matches native frame $frame',
	{timeout: 30_000},
	async ({fixture, frame}) => {
		const reference = await captureNativeReference(fixture, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: fixture,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		if (result.mismatchedPixels > 0) {
			await savePixelEvidence(reference, `${fixture.id}-reference-${frame}`);
			await savePixelEvidence(actual, `${fixture.id}-actual-${frame}`);
			await savePixelEvidence(result.diff, `${fixture.id}-diff-${frame}`);
		}

		expect(result.mismatchedPixels).toBe(0);
	},
);

test('renders raster URL background sizes and repeats', async () => {
	const blob = await (
		await renderStillOnWeb({
			composition: backgroundImageUrl,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	await testImage({
		blob,
		testId: 'background-image-url',
		threshold: 0,
		allowedMismatchedPixelRatio: 0,
	});
});

// PR #13036: source-in must mask combined backgrounds once, not multiply glyph alpha.
test('opaque text background ignores the color alpha underneath', async (t) => {
	const fixture = (backgroundColor: string) => ({
		id: 'background-text-mask-alpha',
		width: 400,
		height: 120,
		fps: 25,
		durationInFrames: 1,
		component: () => (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div
					style={{
						width: 400,
						height: 120,
						fontFamily: 'Arial',
						fontSize: 96,
						fontWeight: 900,
						lineHeight: '120px',
						backgroundColor,
						backgroundImage: 'linear-gradient(to right, #123456, #654321)',
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						color: 'transparent',
					}}
				>
					MASK
				</div>
			</AbsoluteFill>
		),
	});
	const render = async (backgroundColor: string) =>
		(
			await renderStillOnWeb({
				composition: fixture(backgroundColor),
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
	const semi = await render('rgba(255,0,0,0.5)');
	const opaque = await render('rgb(255,0,0)');
	const result = await compareNativePixels(opaque, semi);
	if (t.task.file.projectName !== 'firefox') {
		await savePixelEvidence(opaque, 'background-text-mask-opaque');
		await savePixelEvidence(semi, 'background-text-mask-semi');
		await savePixelEvidence(result.diff, 'background-text-mask-diff');
	}

	expect(result.mismatchedPixels).toBe(0);
});

// PR #13036: preserve the native contain repeat period.
test('renders native contain tile repeat periods', async () => {
	const blob = await (
		await renderStillOnWeb({
			composition: backgroundImageContain,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	await testImage({
		blob,
		testId: 'background-image-contain',
		threshold: 0,
		allowedMismatchedPixelRatio: 0,
	});
});

// Pixelated patterns must not change the sampler used by later auto backgrounds.
test('pixelated backgrounds restore smoothing before later siblings', async () => {
	const fixture = (paintPixelated: boolean) => ({
		id: 'pixelated-sampler-lifetime',
		width: 64,
		height: 128,
		fps: 25,
		durationInFrames: 1,
		component: () => (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div
					style={{
						position: 'absolute',
						width: 64,
						height: 64,
						backgroundImage: paintPixelated
							? `url("${pixelatedRaster}")`
							: 'none',
						backgroundSize: '16px 16px',
						imageRendering: 'pixelated',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						width: 64,
						height: 64,
						backgroundColor: 'white',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: 64,
						width: 64,
						height: 64,
						backgroundImage: `url("${pixelatedRaster}")`,
						backgroundSize: '16px 16px',
						imageRendering: 'auto',
					}}
				/>
			</AbsoluteFill>
		),
	});
	const render = async (paintPixelated: boolean) =>
		(
			await renderStillOnWeb({
				composition: fixture(paintPixelated),
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
	const control = await render(false);
	const afterPixelated = await render(true);
	const result = await compareNativePixels(control, afterPixelated);
	if (result.mismatchedPixels > 0) {
		await savePixelEvidence(control, 'pixelated-state-control');
		await savePixelEvidence(afterPixelated, 'pixelated-state-after');
		await savePixelEvidence(result.diff, 'pixelated-state-diff');
	}

	expect(result.mismatchedPixels).toBe(0);
});
