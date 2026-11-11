import {expect, test, vi} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {makeInternalState} from '../internal-state';
import {renderStillOnWeb} from '../render-still-on-web';
import {createLayer} from '../take-screenshot';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {
	svgPrecomposeFont,
	svgPrecomposeFontSources,
	svgPrecomposeFontEffects,
} from './fixtures/svg-precompose-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(
	svgPrecomposeFontSources.flatMap((source) =>
		svgPrecomposeFontEffects.flatMap((effect) =>
			[0, 1].map((frame) => ({source, effect, frame})),
		),
	),
)(
	'preserves precomposed SVG font $source $effect frame $frame',
	async ({source, effect, frame}, t) => {
		const composition = svgPrecomposeFont({
			source,
			effect,
			literal: false,
			fontStep: null,
			paint: null,
		});
		const control = svgPrecomposeFont({
			source,
			effect,
			literal: true,
			fontStep: null,
			paint: null,
		});
		const native = await captureNativeReference(composition, frame, {
			omitBackground: false,
		});
		const literalNative = await captureNativeReference(control, frame, {
			omitBackground: false,
		});
		expect(
			(await compareNativePixels(native, literalNative)).mismatchedPixels,
		).toBe(0);
		const render = async (fixture: typeof composition) =>
			(
				await renderStillOnWeb({
					composition: fixture,
					frame,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		const observed =
			server.browser === 'webkit' &&
			source === 'registered' &&
			effect === 'mask' &&
			frame === 0;
		let phase = 'actual';
		const images: {
			phase: string;
			source: CanvasImageSource;
			context: OffscreenCanvasRenderingContext2D;
			operation: string;
			coordinates: unknown[];
			matrix: number[];
			kind: string;
		}[] = [];
		const serialized: {phase: string; text: string}[] = [];
		const draw = OffscreenCanvasRenderingContext2D.prototype.drawImage;
		const fill = OffscreenCanvasRenderingContext2D.prototype.fillRect;
		const serialize = XMLSerializer.prototype.serializeToString;
		function recordDraw(
			this: OffscreenCanvasRenderingContext2D,
			...args: unknown[]
		) {
			images.push({
				phase,
				source: args[0] as CanvasImageSource,
				context: this,
				operation: this.globalCompositeOperation,
				coordinates: args.slice(1),
				matrix: Array.from(this.getTransform().toFloat64Array()),
				kind: 'draw',
			});
			Reflect.apply(draw, this, args);
		}

		function recordFill(
			this: OffscreenCanvasRenderingContext2D,
			...args: unknown[]
		) {
			if (this.globalCompositeOperation === 'destination-in')
				images.push({
					phase,
					source: this.canvas,
					context: this,
					operation: this.globalCompositeOperation,
					coordinates: args,
					matrix: Array.from(this.getTransform().toFloat64Array()),
					kind: 'fill',
				});
			Reflect.apply(fill, this, args);
		}

		const drawSpy = observed
			? vi
					.spyOn(OffscreenCanvasRenderingContext2D.prototype, 'drawImage')
					.mockImplementation(recordDraw)
			: null;
		const fillSpy = observed
			? vi
					.spyOn(OffscreenCanvasRenderingContext2D.prototype, 'fillRect')
					.mockImplementation(recordFill)
			: null;
		const xmlSpy = observed
			? vi
					.spyOn(XMLSerializer.prototype, 'serializeToString')
					.mockImplementation((node) => {
						const text = serialize.call(new XMLSerializer(), node);
						serialized.push({phase, text});
						return text;
					})
			: null;
		let actual: Blob;
		let expected: Blob;
		try {
			actual = await render(composition);
			phase = 'expected';
			expected = await render(control);
		} finally {
			drawSpy?.mockRestore();
			fillSpy?.mockRestore();
			xmlSpy?.mockRestore();
		}

		if (observed) {
			const traces: unknown[] = [];
			for (const [index, image] of images.entries()) {
				const {source: imageSource} = image;
				if (
					!(
						imageSource instanceof OffscreenCanvas ||
						imageSource instanceof HTMLImageElement
					)
				)
					continue;
				if (!imageSource.width || !imageSource.height) {
					traces.push({phase: image.phase, kind: image.kind, disposed: true});
					continue;
				}

				const canvas = new OffscreenCanvas(
					imageSource.width,
					imageSource.height,
				);
				const context = canvas.getContext('2d')!;
				Reflect.apply(draw, context, [imageSource, 0, 0]);
				const blob = await canvas.convertToBlob({type: 'image/png'});
				let binary = '';
				for (const byte of new Uint8Array(await blob.arrayBuffer()))
					binary += String.fromCharCode(byte);
				await server.commands.writeFile(
					`validation/svg-precompose-font-mask-sequence/${server.browser}/${index}-${image.phase}-${image.kind}-source.png`,
					btoa(binary),
					'base64',
				);
				traces.push({
					phase: image.phase,
					kind: image.kind,
					operation: image.operation,
					coordinates: image.coordinates,
					matrix: image.matrix,
					sourceSize: [imageSource.width, imageSource.height],
					destinationSize: [
						image.context.canvas.width,
						image.context.canvas.height,
					],
					sourcePixel: Array.from(context.getImageData(38, 32, 1, 1).data),
					destinationPixel: Array.from(
						image.context.getImageData(38, 32, 1, 1).data,
					),
				});
			}

			await server.commands.writeFile(
				`validation/svg-precompose-font-mask-sequence/${server.browser}/trace.json`,
				JSON.stringify({traces, serialized}, null, 2),
				'utf8',
			);
		}

		const result = await compareNativePixels(expected, actual);
		const nativeResult = await compareNativePixels(native, actual);
		for (const [name, blob] of [
			['native', native],
			['actual', actual],
			['expected', expected],
			['diff', result.diff],
			['native-diff', nativeResult.diff],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-precompose-font/${server.browser}/${source}-${effect}-${frame}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		expect(result.mismatchedPixels).toBe(0);
		expect(result.maxChannelDelta).toBe(0);
		if (t.task.file.projectName === 'chromium')
			expect(nativeResult.mismatchedPixels).toBe(0);
	},
);

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
			for (const [name, blob] of [
				['actual', actual],
				['expected', expected],
				['diff', result.diff],
			] as const) {
				let binary = '';
				for (const byte of new Uint8Array(await blob.arrayBuffer()))
					binary += String.fromCharCode(byte);
				await server.commands.writeFile(
					`validation/svg-precompose-font/${server.browser}/same-svg-${frame}-${name}.png`,
					btoa(binary),
					'base64',
				);
			}

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
