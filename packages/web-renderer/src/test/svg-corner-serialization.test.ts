import '../symbol-dispose';
import {expect, test} from 'vitest';
import {preserveSvgAttributeSelectors} from '../drawing/preserve-svg-style-selectors';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {
	svgCornerDeclarationMarkup,
	svgCornerShapeValues,
} from './fixtures/svg-corner-styles';
import {svgForeignObjectFontReady} from './fixtures/svg-foreign-object-font';

test.each(['inline', 'stylesheet'] as const)(
	'preserves %s declarations when corner expansion rewrites style selectors',
	async (kind) => {
		const host = document.createElement('div');
		host.innerHTML = svgCornerDeclarationMarkup;
		document.body.appendChild(host);
		const svg = host.querySelector('svg')!;
		const box = svg.querySelector<HTMLElement>('[data-inline-corner]')!;
		const expected = ['padding', 'background', 'border'].map((property) => ({
			property,
			value: box.style.getPropertyValue(property),
			priority: box.style.getPropertyPriority(property),
		}));
		const original = svg.outerHTML;
		let image: HTMLImageElement | null = null;
		try {
			for (const declaration of expected)
				expect(declaration.value).toContain('var(');
			const pending = turnSvgIntoDrawable(svg);
			expect(turnSvgIntoDrawable(svg)).toBe(pending);
			image = await pending;
			const parsed = new DOMParser().parseFromString(
				decodeURIComponent(
					image.src.slice('data:image/svg+xml;charset=utf-8,'.length),
				),
				'image/svg+xml',
			);
			expect(parsed.querySelector('parsererror')).toBe(null);
			if (kind === 'inline') {
				const encoded = parsed.querySelector<HTMLElement>(
					'[data-inline-corner]',
				)!;
				for (const {property, value, priority} of expected) {
					expect(encoded.style.getPropertyValue(property)).toBe(value);
					expect(encoded.style.getPropertyPriority(property)).toBe(priority);
				}
			} else {
				expect(parsed.querySelector('style')!.textContent).not.toMatch(
					/(?:^|[;{])\s*corner\s*:/,
				);
			}

			expect(svg.outerHTML).toBe(original);
			expect(svg.querySelector('[data-inline-corner]')).toBe(box);
		} finally {
			image?.removeAttribute('src');
			host.remove();
		}
	},
);

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
	for (const cssom of [false, true]) {
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
		const style = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'style',
		);
		const scoped = `@scope { ${selector} { background-color: blue !important; } }`;
		style.textContent = cssom ? '' : scoped;
		svg.prepend(style);
		document.body.appendChild(svg);
		let image: HTMLImageElement | null = null;
		try {
			if (cssom) {
				await svgForeignObjectFontReady;
				const text = document.createElementNS(
					'http://www.w3.org/1999/xhtml',
					'span',
				);
				text.style.fontFamily = 'Foreign object registered font';
				text.textContent = 'A';
				box.parentElement!.appendChild(text);
				if (!style.sheet) throw new Error('SVG stylesheet is not ready');
				style.sheet.insertRule(`@media all { ${scoped} }`);
			}

			const rules = Array.from(
				style.sheet?.cssRules ?? [],
				(rule) => rule.cssText,
			).join('');
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
			if (cssom) {
				const serializedRules = parsed.querySelector('style')!.textContent!;
				expect(serializedRules).toContain(rules);
				expect(serializedRules).toContain('@font-face');
			} else {
				expect(parsed.querySelector('style')!.textContent).toBe(
					style.textContent,
				);
			}

			expect(
				Array.from(style.sheet?.cssRules ?? [], (rule) => rule.cssText).join(
					'',
				),
			).toBe(rules);
			expect(svg.outerHTML).toBe(original);
		} finally {
			image?.removeAttribute('src');
			svg.remove();
		}
	}
});

test('preserves logical corner precedence when expanding SVG declarations', () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `<style>svg[style] { color: black; } @media (min-width: 300px) {
		.corner { border-radius: 12px; corner-shape: bevel; border-start-start-radius: 30px; }
		.important { border-radius: 12px !important; corner-shape: bevel !important; border-start-start-radius: 30px !important; }
		.before { border-start-start-radius: 30px; border-radius: 12px; corner-shape: bevel; }
		.tokens { --tokens: {a:b; nested:{corner: 2px round;}}; --quote: "; corner: 4px round;"; border-radius: 12px; corner-shape: bevel; border-start-start-radius: 30px; }
	}</style><foreignObject width="200" height="200">
		<div xmlns="http://www.w3.org/1999/xhtml"></div>
	</foreignObject>`;
	const element = svg.querySelector('div')!;
	const properties = [
		'top-left',
		'top-right',
		'bottom-right',
		'bottom-left',
	].flatMap((corner) => [`border-${corner}-radius`, `corner-${corner}-shape`]);
	properties.push('--tokens', '--quote');
	document.body.appendChild(svg);
	try {
		const expected: string[][] = [];
		for (const className of ['corner', 'important', 'before', 'tokens']) {
			for (const direction of ['ltr', 'rtl']) {
				for (const writingMode of ['horizontal-tb', 'vertical-rl']) {
					element.className = className;
					element.style.direction = direction;
					element.style.writingMode = writingMode;
					const computed = getComputedStyle(element);
					expected.push(
						properties.map((property) => computed.getPropertyValue(property)),
					);
				}
			}
		}

		preserveSvgAttributeSelectors({
			svg,
			authoredStyles: [svg, ...svg.querySelectorAll('*')].map((node) =>
				node.getAttribute('style'),
			),
			authoredEmpty: null,
			authoredMedia: null,
		});
		let index = 0;
		for (const className of ['corner', 'important', 'before', 'tokens']) {
			for (const direction of ['ltr', 'rtl']) {
				for (const writingMode of ['horizontal-tb', 'vertical-rl']) {
					element.className = className;
					element.style.direction = direction;
					element.style.writingMode = writingMode;
					const computed = getComputedStyle(element);
					expect(
						properties.map((property) => computed.getPropertyValue(property)),
					).toEqual(expected[index++]);
				}
			}
		}
	} finally {
		svg.remove();
	}
});

test('preserves blockless nested SVG declarations with custom-property braces', () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `<style>svg[style] { color: black; } @media (min-width: 300px) {
		.nested {
			& > rect { fill: blue; }
			--tokens: {a:b}; border-radius: 12px; corner-shape: bevel; fill: red;
		}
	}</style><g class="nested"><rect width="20" height="20" /></g>`;
	document.body.appendChild(svg);
	try {
		const element = svg.querySelector('g')!;
		const properties = [
			'--tokens',
			'fill',
			'border-top-left-radius',
			'corner-top-left-shape',
		];
		const expected = properties.map((property) =>
			getComputedStyle(element).getPropertyValue(property),
		);
		expect(expected[0]).toContain('a:b');
		expect(expected[1]).toBe('rgb(255, 0, 0)');
		preserveSvgAttributeSelectors({
			svg,
			authoredStyles: [svg, ...svg.querySelectorAll('*')].map((node) =>
				node.getAttribute('style'),
			),
			authoredEmpty: null,
			authoredMedia: null,
		});
		expect(
			properties.map((property) =>
				getComputedStyle(element).getPropertyValue(property),
			),
		).toEqual(expected);
		expect(getComputedStyle(svg.querySelector('rect')!).fill).toBe(
			'rgb(0, 0, 255)',
		);
	} finally {
		svg.remove();
	}
});
