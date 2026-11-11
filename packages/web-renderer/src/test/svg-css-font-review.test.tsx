import {expect, test} from 'vitest';
import '../symbol-dispose';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {svgFontReviewCarrier} from './fixtures/svg-font-review-carrier';
import {captureNativeReference, countNativePixels} from './native-reference';

test.for([0, 1])(
	'retains registered fonts after an EOF stylesheet comment at frame %i',
	async (frame, t) => {
		await svgExternalFontReady;
		const composition = svgFontReviewCarrier({literal: false});
		const control = svgFontReviewCarrier({literal: true});
		const options = {
			frame,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		} as const;
		const actual = await (
			await renderStillOnWeb({...options, composition})
		).blob({format: 'png'});
		const expected = await (
			await renderStillOnWeb({...options, composition: control})
		).blob({format: 'png'});
		expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		if (t.task.file.projectName === 'chromium') {
			const reference = await captureNativeReference(composition, frame, {
				omitBackground: false,
			});
			expect(
				(await countNativePixels(reference, actual)).mismatchedPixels,
			).toBe(0);
		}
	},
);

test.for([
	'top',
	'media',
	'supports',
	'nested',
	'inactive',
	'disabled',
	'iframe',
	'link',
])('retains CSS font source and text selection from $0', async (mode) => {
	const url = new URL('../../../example/public/bangers.woff2', import.meta.url)
		.href;
	const blob = await (await fetch(url)).blob();
	const data = await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
	const iframe = mode === 'iframe' ? document.createElement('iframe') : null;
	if (iframe) document.body.appendChild(iframe);
	const owner = iframe?.contentDocument ?? document;
	const ownerWindow = owner.defaultView! as Window & typeof globalThis;
	const family = `SVG review ${mode}`;
	const face = `@font-face{font-family:"${family}";src:url("${data}") format("woff2")}`;
	const selector = `.font-review-label{font-family:"${family}";font-size:34px}`;
	const group =
		mode === 'media'
			? `@media all{${face}}`
			: mode === 'supports'
				? `@supports(display:grid){${face}}`
				: mode === 'nested' || mode === 'iframe'
					? `@media all{@supports(display:grid){${face}}}`
					: mode === 'inactive'
						? `@media not all{${face}}`
						: face;
	const sheet = new ownerWindow.CSSStyleSheet();
	sheet.replaceSync(group + selector);
	const adopted = [...owner.adoptedStyleSheets];
	const ordinary = mode === 'link' ? owner.createElement('style') : null;
	if (ordinary) {
		ordinary.textContent = group + selector;
		owner.head.appendChild(ordinary);
	} else {
		owner.adoptedStyleSheets = [...adopted, sheet];
		sheet.disabled = mode === 'disabled';
		expect(sheet.disabled).toBe(mode === 'disabled');
	}

	const active = mode !== 'inactive' && mode !== 'disabled';
	const makeSvg = (literal: boolean, fallback: boolean) => {
		const svg = owner.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '300');
		svg.setAttribute('height', '70');
		const text =
			mode === 'link'
				? '<text x="8" y="48"><a class="font-review-label">Linked font</a></text>'
				: '<text x="8" y="48" class="font-review-label">Adopted font</text>';
		svg.innerHTML = '<rect width="300" height="70" fill="white"/>' + text;
		if (literal) {
			const label = svg.querySelector<SVGElement>(
				mode === 'link' ? 'a' : 'text',
			)!;
			label.removeAttribute('class');
			label.style.fontFamily = fallback ? 'serif' : '"SVG review literal"';
			label.style.fontSize = '34px';
			if (!fallback) {
				const style = owner.createElementNS(
					'http://www.w3.org/2000/svg',
					'style',
				);
				style.textContent = `@font-face{font-family:"SVG review literal";src:url("${data}") format("woff2")}`;
				svg.prepend(style);
			}
		}

		if (!literal && mode !== 'link') {
			const label = svg.querySelector<SVGElement>('text')!;
			label.style.fontFamily = JSON.stringify(family);
			label.style.fontSize = '34px';
		}

		owner.body.appendChild(svg);
		return svg;
	};

	const draw = async (svg: SVGSVGElement) => {
		const canvas = new OffscreenCanvas(300, 70);
		try {
			canvas.getContext('2d')!.drawImage(await turnSvgIntoDrawable(svg), 0, 0);
			return await canvas.convertToBlob({type: 'image/png'});
		} finally {
			canvas.width = 0;
			canvas.height = 0;
		}
	};

	const nodes: SVGSVGElement[] = [];
	try {
		if (active) {
			const [loadedFace] = await owner.fonts.load(`34px "${family}"`);
			expect(loadedFace?.status).toBe('loaded');
		}

		const svg = makeSvg(false, false);
		nodes.push(svg);
		const actual = await draw(svg);
		const control = makeSvg(true, !active);
		nodes.push(control);
		const expected = await draw(control);
		expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
		if (active) {
			const fallback = makeSvg(true, true);
			nodes.push(fallback);
			expect(
				(await countNativePixels(expected, await draw(fallback)))
					.mismatchedPixels,
			).toBeGreaterThan(0);
		}
	} finally {
		nodes.forEach((n) => n.remove());
		ordinary?.remove();
		owner.adoptedStyleSheets = adopted;
		iframe?.remove();
	}
});
