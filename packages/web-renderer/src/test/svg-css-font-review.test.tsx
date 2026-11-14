import {expect, test} from 'vitest';
import '../symbol-dispose';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {countNativePixels} from './native-reference';

test.for([
	'top',
	'media',
	'supports',
	'nested',
	'inactive',
	'disabled',
	'iframe',
	'link',
	'cdata',
	'titled',
	'titled-cdata',
	'document-title',
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
	const documentTitle = mode === 'document-title';
	const cdata = mode.includes('cdata');
	const linked = mode === 'link' || cdata;
	const iframe =
		mode === 'iframe' || mode.startsWith('titled') || documentTitle
			? document.createElement('iframe')
			: null;
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
	sheet.replaceSync((documentTitle ? '' : group) + selector);
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

	const titledSheets: HTMLStyleElement[] = [];
	if (documentTitle) {
		const otherUrl = new URL(
			'../../../example/public/Roboto-Medium.ttf',
			import.meta.url,
		).href;
		const otherBlob = await (await fetch(otherUrl)).blob();
		const otherData = await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(otherBlob);
		});
		for (const [title, source, format] of [
			['a', data, 'woff2'],
			['b', otherData, 'truetype'],
		]) {
			const style = owner.createElement('style');
			style.title = title;
			style.textContent = `@font-face{font-family:"${family}";src:url("${source}") format("${format}")}`;
			owner.head.appendChild(style);
			titledSheets.push(style);
		}
	}

	const active = mode !== 'inactive' && mode !== 'disabled';
	const makeSvg = (literal: boolean, fallback: boolean) => {
		const svg = owner.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '300');
		svg.setAttribute('height', '70');
		const text = linked
			? '<text x="8" y="48"><a class="font-review-label">Linked font</a></text>'
			: '<text x="8" y="48" class="font-review-label">Adopted font</text>';
		svg.innerHTML = '<rect width="300" height="70" fill="white"/>' + text;
		if (literal) {
			const label = svg.querySelector<SVGElement>(linked ? 'a' : 'text')!;
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

		if (!literal && !linked) {
			const label = svg.querySelector<SVGElement>('text')!;
			label.style.fontFamily = JSON.stringify(family);
			label.style.fontSize = '34px';
		}

		if (cdata) {
			const label = svg.querySelector('a')!;
			const xml = new ownerWindow.DOMParser().parseFromString(
				'<svg xmlns="http://www.w3.org/2000/svg"><text><![CDATA[Linked font]]></text></svg>',
				'image/svg+xml',
			);
			label.replaceChildren(
				owner.importNode(xml.querySelector('text')!.firstChild!, true),
			);
			expect(label.firstChild!.nodeType).toBe(Node.CDATA_SECTION_NODE);
		}

		if (!literal && mode.startsWith('titled')) {
			for (const title of ['a', 'b']) {
				const carrier = owner.createElementNS(
					'http://www.w3.org/2000/svg',
					'style',
				);
				carrier.setAttribute('title', title);
				carrier.textContent = '/* Preferred stylesheet carrier. */';
				svg.append(carrier);
			}
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
		if (documentTitle) {
			await owner.fonts.load('34px "SVG review literal"');
			expect(svg.querySelector('text')!.getComputedTextLength()).toBe(
				control.querySelector('text')!.getComputedTextLength(),
			);
			expect(titledSheets.map((style) => style.sheet!.title)).toEqual([
				'a',
				'b',
			]);
		}

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
		titledSheets.forEach((style) => style.remove());
		owner.adoptedStyleSheets = adopted;
		iframe?.remove();
	}
});
