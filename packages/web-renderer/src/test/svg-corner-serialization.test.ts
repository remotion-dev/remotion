import {expect, test} from 'vitest';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {svgCornerShapeValues} from './fixtures/svg-corner-styles';

test('preserves authored corner styles, selectors and drawable cache without mutating mounted HTML', async () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '40');
	svg.setAttribute('height', '40');
	svg.innerHTML =
		'<foreignObject width="40" height="40"><div xmlns="http://www.w3.org/1999/xhtml" data-corner-probe="" /></foreignObject>';
	const box = svg.querySelector<HTMLElement>('[data-corner-probe]')!;
	Object.assign(box.style, {
		width: '40px',
		height: '40px',
		backgroundColor: 'red',
		borderRadius: '12px 8px 16px 10px / 8px 12px 10px 16px',
	});
	box.style.setProperty('corner-shape', svgCornerShapeValues[7], 'important');
	const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
	const disabledScope = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'style',
	);
	disabledScope.textContent =
		'@scope { [data-corner-probe] { background-color: lime !important; } }';
	svg.appendChild(disabledScope);
	const images = new Set<HTMLImageElement>();
	document.body.appendChild(svg);
	try {
		if (!disabledScope.sheet) throw new Error('SVG stylesheet is not ready');
		disabledScope.sheet.disabled = true;
		for (const {radius, priority} of ['', 'important'].flatMap(
			(selectedPriority) => [
				{
					radius: '12px 8px 16px 10px / 8px 12px 10px 16px',
					priority: selectedPriority,
				},
				{
					radius: '8px 12px 10px 16px / 12px 8px 16px 10px',
					priority: selectedPriority,
				},
			],
		)) {
			box.style.setProperty('corner-shape', svgCornerShapeValues[7], priority);
			box.style.setProperty('border-radius', radius, priority);
			const authored = box.getAttribute('style')!;
			style.textContent = `[data-corner-probe][style=${JSON.stringify(authored)}] {background-color: blue !important}`;
			svg.prepend(style);
			const original = svg.outerHTML;
			const pending = turnSvgIntoDrawable(svg);
			expect(turnSvgIntoDrawable(svg)).toBe(pending);
			const image = await pending;
			expect(images.has(image)).toBe(false);
			images.add(image);
			const prefix = 'data:image/svg+xml;charset=utf-8,';
			expect(image.src.startsWith(prefix)).toBe(true);
			const markup = decodeURIComponent(image.src.slice(prefix.length));
			const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');
			expect(parsed.querySelector('parsererror')).toBe(null);
			const encoded = parsed.querySelector<HTMLElement>('[data-corner-probe]')!;
			if (/(?:^|;)\s*corner\s*:/.test(box.style.cssText)) {
				expect(encoded.getAttribute('style')).toContain(
					'border-top-left-radius:',
				);
				expect(encoded.getAttribute('style')).toContain(
					'corner-top-left-shape:',
				);
				expect(encoded.getAttribute('style')).not.toMatch(
					/(?:^|;)\s*corner\s*:/,
				);
				expect(
					Array.from(encoded.attributes).some(
						(attribute) =>
							attribute.name.startsWith('data-remotion-authored-style') &&
							attribute.value === authored,
					),
				).toBe(true);
			}

			for (const corner of [
				'top-left',
				'top-right',
				'bottom-right',
				'bottom-left',
			]) {
				for (const property of [
					`border-${corner}-radius`,
					`corner-${corner}-shape`,
				]) {
					expect(encoded.style.getPropertyValue(property)).toBe(
						box.style.getPropertyValue(property),
					);
					expect(encoded.style.getPropertyPriority(property)).toBe(
						box.style.getPropertyPriority(property),
					);
				}
			}

			expect(svg.outerHTML).toBe(original);
			expect(svg.querySelector('[data-corner-probe]')).toBe(box);
			expect(svg.querySelector('style')).toBe(style);
			expect(disabledScope.sheet.disabled).toBe(true);
		}
	} finally {
		for (const image of images) image.removeAttribute('src');
		svg.remove();
	}
});

test('retains authored style matching when scoped selectors cannot be rewritten', async () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '40');
	svg.setAttribute('height', '40');
	svg.innerHTML =
		'<foreignObject width="40" height="40"><div xmlns="http://www.w3.org/1999/xhtml" data-corner-probe="" /></foreignObject>';
	const box = svg.querySelector<HTMLElement>('[data-corner-probe]')!;
	Object.assign(box.style, {
		width: '40px',
		height: '40px',
		borderRadius: '12px',
		backgroundColor: 'red',
	});
	box.style.setProperty('corner-shape', 'bevel');
	const authored = box.getAttribute('style')!;
	const selector = `[data-corner-probe][style=${JSON.stringify(authored)}]`;
	const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
	style.textContent = `@scope { ${selector} { background-color: blue !important; } }`;
	svg.prepend(style);
	document.body.appendChild(svg);
	let image: HTMLImageElement | null = null;
	try {
		const original = svg.outerHTML;
		image = await turnSvgIntoDrawable(svg);
		const prefix = 'data:image/svg+xml;charset=utf-8,';
		expect(image.src.startsWith(prefix)).toBe(true);
		const parsed = new DOMParser().parseFromString(
			decodeURIComponent(image.src.slice(prefix.length)),
			'image/svg+xml',
		);
		const encoded = parsed.querySelector('[data-corner-probe]')!;
		expect(encoded.getAttribute('style')).toBe(authored);
		expect(parsed.querySelector(selector)).toBe(encoded);
		expect(parsed.querySelector('style')!.textContent).toBe(style.textContent);
		expect(svg.outerHTML).toBe(original);
	} finally {
		image?.removeAttribute('src');
		svg.remove();
	}
});
