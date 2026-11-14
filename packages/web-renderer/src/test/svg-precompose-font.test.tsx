import {expect, test} from 'vitest';
import '../symbol-dispose';
import {makeInternalState} from '../internal-state';
import {renderStillOnWeb} from '../render-still-on-web';
import {createLayer} from '../take-screenshot';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {
	svgPrecomposeFont,
	svgPrecomposeFontSources,
	svgPrecomposeFontEffects,
	svgPrecomposePaintKinds,
} from './fixtures/svg-precompose-font';
import {compareNativePixels} from './native-reference';
import {testCompositions} from './utils';

test('preserves SVG fonts through intermediate layers and paint bounds', async () => {
	await testCompositions({
		cases: svgPrecomposeFontSources.flatMap((source) => [
			...svgPrecomposeFontEffects.map((effect) => ({
				composition: svgPrecomposeFont({
					source,
					effect,
					literal: false,
					fontStep: null,
					paint: null,
				}),
				frame: 1,
			})),
			...svgPrecomposePaintKinds.map((paint) => ({
				composition: svgPrecomposeFont({
					source,
					effect: 'blend',
					literal: false,
					fontStep: null,
					paint,
				}),
				frame: 1,
			})),
			{
				composition: svgPrecomposeFont({
					source,
					effect: 'blend',
					literal: false,
					fontStep: 4,
					paint: null,
				}),
				frame: 1,
			},
		]),
		columns: 4,
		testId: 'svg-precompose-fonts-and-paint-bounds',
		scale: null,
	});
});

test('refreshes font snapshots between captures of the same SVG', async () => {
	await svgExternalFontReady;
	const style = document.createElement('style');
	const host = document.createElement('div');
	Object.assign(host.style, {
		position: 'relative',
		width: '320px',
		height: '100px',
		backgroundColor: 'white',
	});
	host.innerHTML =
		'<svg xmlns="http://www.w3.org/2000/svg" class="same-svg-font-capture" width="320" height="100"><text x="12" y="62">SVG font capture</text></svg>';
	const svg = host.firstElementChild!;
	document.head.appendChild(style);
	document.body.appendChild(host);
	using internalState = makeInternalState();
	let previous: Blob | null = null;
	try {
		for (const frame of [0, 1]) {
			style.textContent = `.same-svg-font-capture {font-family:monospace;font-size:20px;filter:drop-shadow(3px 2px 0px #222)} .same-svg-font-capture:not([style]) text {font-family:"External SVG, class font";font-size:${40 + frame * 3}px}`;
			const context = await createLayer({
				element: host,
				scale: 1,
				logLevel: 'error',
				internalState,
				onlyBackgroundClipText: false,
				cutout: host.getBoundingClientRect(),
				transparent: true,
				waitForPageResponsiveness: null,
				svgFontSnapshots: null,
			});
			const actual = await context.canvas.convertToBlob({type: 'image/png'});
			const expected = await (
				await renderStillOnWeb({
					composition: svgPrecomposeFont({
						source: 'registered',
						effect: 'drop-shadow',
						literal: true,
						fontStep: null,
						paint: null,
					}),
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
			const result = await compareNativePixels(expected, actual);

			expect(svg.getAttribute('style')).toBeNull();
			expect(svg.querySelector('text')!.getAttribute('style')).toBeNull();
			expect(result.mismatchedPixels).toBe(0);
			if (previous)
				expect(
					(await compareNativePixels(previous, actual)).mismatchedPixels,
				).toBeGreaterThan(0);
			previous = actual;
		}
	} finally {
		host.remove();
		style.remove();
	}
});
