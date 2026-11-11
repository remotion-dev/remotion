import {expect, test, vi} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {svgPrecomposeFont} from './fixtures/svg-precompose-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(['registered', 'import'] as const)(
	'measures precomposed blend alpha and geometry for $0',
	async (source) => {
		await svgExternalFontReady;
		const fixture = svgPrecomposeFont({
			source,
			effect: 'blend',
			literal: true,
			fontStep: null,
			paint: null,
		});
		const noBlend = svgPrecomposeFont({
			source,
			effect: 'none',
			literal: true,
			fontStep: null,
			paint: null,
		});
		const native = await captureNativeReference(fixture, 1, {
			omitBackground: false,
		});
		const nativeNoBlend = await captureNativeReference(noBlend, 1, {
			omitBackground: false,
		});
		const render = async (composition: typeof fixture) =>
			(
				await renderStillOnWeb({
					composition,
					frame: 1,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		const plain = await render(fixture);
		const plainNoBlend = await render(noBlend);
		const traces: unknown[] = [];
		const draw = OffscreenCanvasRenderingContext2D.prototype.drawImage;
		function recordDraw(
			this: OffscreenCanvasRenderingContext2D,
			...args: unknown[]
		) {
			const before = Array.from(this.getImageData(281, 30, 1, 1).data);
			const operation = this.globalCompositeOperation;
			const {filter} = this;
			const matrix = Array.from(this.getTransform().toFloat64Array());
			Reflect.apply(draw, this, args);
			const after = Array.from(this.getImageData(281, 30, 1, 1).data);
			const sourceImage = args[0];
			let sample: number[] | null = null;
			let sourceSize: number[] | null = null;
			if (
				sourceImage instanceof OffscreenCanvas ||
				sourceImage instanceof HTMLCanvasElement ||
				sourceImage instanceof HTMLImageElement
			) {
				sourceSize = [sourceImage.width, sourceImage.height];
				const sampleCanvas = new OffscreenCanvas(
					Math.max(1, sourceImage.width),
					Math.max(1, sourceImage.height),
				);
				const sampleContext = sampleCanvas.getContext('2d')!;
				Reflect.apply(draw, sampleContext, [sourceImage, 0, 0]);
				sample = Array.from(sampleContext.getImageData(281, 30, 1, 1).data);
			}

			traces.push({
				operation,
				filter,
				matrix,
				coordinates: args.slice(1),
				destination: [this.canvas.width, this.canvas.height],
				sourceSize,
				source: sample,
				before,
				after,
			});
		}

		const spy = vi
			.spyOn(OffscreenCanvasRenderingContext2D.prototype, 'drawImage')
			.mockImplementation(recordDraw);
		let instrumented: Blob;
		try {
			instrumented = await render(fixture);
		} finally {
			spy.mockRestore();
		}

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '320');
		svg.setAttribute('height', '100');
		svg.innerHTML =
			'<text x="12" y="62" style="font-family:&quot;External SVG, class font&quot;;font-size:43px">SVG font capture</text>';
		document.body.appendChild(svg);
		let geometry: unknown;
		try {
			const text = svg.firstElementChild as SVGTextElement;
			const box = text.getBBox();
			const last = text.getExtentOfChar(text.getNumberOfChars() - 1);
			geometry = {
				svg: svg.getBoundingClientRect().toJSON(),
				text: text.getBoundingClientRect().toJSON(),
				box: {
					x: box.x,
					y: box.y,
					width: box.width,
					height: box.height,
					right: box.x + box.width,
					bottom: box.y + box.height,
				},
				last: {
					x: last.x,
					y: last.y,
					width: last.width,
					height: last.height,
					right: last.x + last.width,
				},
			};
		} finally {
			svg.remove();
		}

		for (const [name, blob] of [
			['native', native],
			['native-none', nativeNoBlend],
			['plain', plain],
			['plain-none', plainNoBlend],
			['instrumented', instrumented],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-precompose-font-blend-probe/${server.browser}/${source}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		await server.commands.writeFile(
			`validation/svg-precompose-font-blend-probe/${server.browser}/${source}-trace.json`,
			JSON.stringify({traces, geometry}, null, 2),
			'utf8',
		);
		expect(traces.length).toBeGreaterThan(0);
		expect(
			(await compareNativePixels(plain, instrumented)).mismatchedPixels,
		).toBe(0);
	},
);
