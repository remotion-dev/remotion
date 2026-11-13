import {expect, test} from 'vitest';
import '../symbol-dispose';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';

// KINO-7769: Media changes must invalidate the drawable even when SVG text styles do not change.
test('active conditional faces invalidate an unchanged SVG drawable', async (t) => {
	if (t.task.file.projectName !== 'chromium') {
		t.skip();
		return;
	}

	const bangers = new URL(
		'../../../example/public/bangers.woff2',
		import.meta.url,
	).pathname;
	const roboto = new URL(
		'../../../example/public/Roboto-Medium.ttf',
		import.meta.url,
	).pathname;
	const style = document.createElement('style');
	style.textContent = `@media(min-width:900px){@font-face{font-family:"Conditional cache font";src:url("${bangers}") format("woff2")}}@media(max-width:1px){@font-face{font-family:"Conditional cache font";src:url("${roboto}") format("truetype")}}`;
	document.head.appendChild(style);
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '500');
	svg.setAttribute('height', '80');
	svg.innerHTML =
		'<text x="12" y="50" style="font-family:Conditional cache font;font-size:34px">Conditional cache</text>';
	document.body.appendChild(svg);
	try {
		await document.fonts.load('34px "Conditional cache font"');
		const before = svg.outerHTML;
		const first = turnSvgIntoDrawable(svg);
		await first;
		const [active, inactive] = Array.from(
			style.sheet!.cssRules,
		) as CSSMediaRule[];
		active.media.mediaText = '(max-width:1px)';
		inactive.media.mediaText = '(min-width:900px)';
		await document.fonts.load('34px "Conditional cache font"');
		expect(svg.outerHTML).toBe(before);
		const next = turnSvgIntoDrawable(svg);
		expect(next).not.toBe(first);
		const image = await next;
		const canvas = document.createElement('canvas');
		canvas.width = 500;
		canvas.height = 80;
		const context = canvas.getContext('2d')!;
		context.drawImage(await first, 0, 0);
		const original = context.getImageData(0, 0, 500, 80).data;
		context.clearRect(0, 0, 500, 80);
		context.drawImage(image, 0, 0);
		const updated = context.getImageData(0, 0, 500, 80).data;
		expect(updated.some((value, index) => value !== original[index])).toBe(
			true,
		);
	} finally {
		svg.remove();
		style.remove();
	}
});

test('continues past an unreadable stylesheet in the SVG document realm', async () => {
	const iframe = document.createElement('iframe');
	document.body.appendChild(iframe);
	try {
		const owner = iframe.contentDocument!;
		const ownerWindow = iframe.contentWindow! as Window & typeof globalThis;
		const sheet = owner.createElement('style');
		sheet.textContent = 'body{color:black}';
		owner.head.appendChild(sheet);
		const securityError = new ownerWindow.DOMException(
			'Unreadable stylesheet',
			'SecurityError',
		);
		expect(securityError instanceof DOMException).toBe(false);
		Object.defineProperty(sheet.sheet!, 'cssRules', {
			get: () => {
				throw securityError;
			},
		});

		const svg = owner.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '120');
		svg.setAttribute('height', '40');
		svg.innerHTML = '<text x="4" y="24">iframe text</text>';
		owner.body.appendChild(svg);
		const image = await turnSvgIntoDrawable(svg);
		expect([image.naturalWidth, image.naturalHeight]).toEqual([120, 40]);
	} finally {
		iframe.remove();
	}
});
