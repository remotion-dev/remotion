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
	const images = new Set<HTMLImageElement>();
	document.body.appendChild(svg);
	try {
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
		}
	} finally {
		for (const image of images) image.removeAttribute('src');
		svg.remove();
	}
});
