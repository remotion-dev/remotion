import {expect, test} from 'vitest';
import {preserveSvgAttributeSelectors} from '../drawing/preserve-svg-style-selectors';
import '../symbol-dispose';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgLayoutViewport} from './fixtures/svg-layout-viewport';
import {svgViewportLengthValues} from './fixtures/svg-layout-viewport-lengths';
import {svgViewportMedia} from './fixtures/svg-viewport-media';
import {captureNativeReference, compareNativePixels} from './native-reference';

test('retains unrelated declarations while freezing nested SVG media queries', () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `<style>
		@media (min-width: 300px) {
			.other[data-token="{"] { padding: var(--gap) !important; border-radius: 12px; corner-shape: bevel; }
			@supports (display: block) { @media (max-width: 200px) { rect { fill: red; } } }
		}
	</style>`;
	const options = {
		svg,
		authoredStyles: null,
		authoredEmpty: null,
		authoredMedia: null,
		authoredWidths: null,
		authoredHeights: null,
		preserveMediaQueries: true,
	};
	preserveSvgAttributeSelectors(options);
	const text = svg.querySelector('style')!.textContent!;
	expect(text).toContain('@media all');
	expect(text).toContain('@media not all');
	expect(text).toMatch(/padding:\s*var\(--gap\)\s*!important/);
	expect(text).not.toMatch(/(?:^|[;{])\s*corner\s*:/);
	expect(text).toContain('[data-token="{"]');
});

test('preserves logical corner precedence when expanding SVG declarations', () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `<style>@media (min-width: 300px) {
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
			authoredStyles: null,
			authoredEmpty: null,
			authoredMedia: null,
			authoredWidths: null,
			authoredHeights: null,
			preserveMediaQueries: true,
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
	svg.innerHTML = `<style>@media (min-width: 300px) {
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
			authoredStyles: null,
			authoredEmpty: null,
			authoredMedia: null,
			authoredWidths: null,
			authoredHeights: null,
			preserveMediaQueries: true,
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

test('keeps resized SVG media state detached and refreshes the drawable cache', async () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('width', '320');
	svg.setAttribute('height', '100');
	svg.style.width = '160px';
	svg.style.height = '50px';
	svg.innerHTML =
		'<style>rect {fill: blue} @media (min-width: 300px) {rect {fill: lime}}</style><rect width="160" height="50"/>';
	document.body.appendChild(svg);
	try {
		const style = svg.querySelector('style')!;
		const {sheet} = style;
		const mounted = svg.outerHTML;
		const first = turnSvgIntoDrawable(svg);
		expect(turnSvgIntoDrawable(svg)).toBe(first);
		const canvas = new OffscreenCanvas(160, 50);
		const context = canvas.getContext('2d')!;
		context.drawImage(await first, 0, 0);
		expect(Array.from(context.getImageData(20, 20, 1, 1).data)).toEqual([
			0, 255, 0, 255,
		]);
		expect(svg.outerHTML).toBe(mounted);
		expect(style.sheet).toBe(sheet);
		style.textContent = style.textContent!.replace(
			'min-width: 300px',
			'max-width: 200px',
		);
		const changed = svg.outerHTML;
		const second = turnSvgIntoDrawable(svg);
		expect(second).not.toBe(first);
		context.clearRect(0, 0, 160, 50);
		context.drawImage(await second, 0, 0);
		expect(Array.from(context.getImageData(20, 20, 1, 1).data)).toEqual([
			0, 0, 255, 255,
		]);
		expect(svg.outerHTML).toBe(changed);
		expect(svg.querySelector('style')).toBe(style);
	} finally {
		svg.remove();
	}
});

test('preserves owning-document media queries when resolving the SVG viewport', async () => {
	expect(matchMedia('(min-width: 300px)').matches).toBe(true);
	expect(matchMedia('(max-width: 200px)').matches).toBe(false);
	const reference = await captureNativeReference(svgViewportMedia, 0, {
		omitBackground: false,
	});
	const still = await renderStillOnWeb({
		composition: svgViewportMedia,
		frame: 0,
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
	});
	const actual = await still.blob({format: 'png'});
	expect((await compareNativePixels(reference, actual)).mismatchedPixels).toBe(
		0,
	);
});

test.for([1, 1.25])(
	'preserves user coordinates when flex layout resizes an SVG at scale %s',
	async (scale) => {
		const still = await renderStillOnWeb({
			composition: svgLayoutViewport,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
			scale,
		});
		const Component = svgLayoutViewport.component;
		const reference = await captureNativeReference(
			{
				...svgLayoutViewport,
				width: svgLayoutViewport.width * scale,
				height: svgLayoutViewport.height * scale,
				component: () => (
					<div
						style={{
							position: 'absolute',
							width: svgLayoutViewport.width,
							height: svgLayoutViewport.height,
							transform: `scale(${scale})`,
							transformOrigin: '0 0',
						}}
					>
						<Component />
					</div>
				),
			},
			0,
			{omitBackground: false},
		);
		const actual = await still.blob({format: 'png'});
		expect(
			(await compareNativePixels(reference, actual)).mismatchedPixels,
		).toBe(0);
	},
);

test('preserves SVG viewport coordinates for native numeric forms and absolute units', async () => {
	const reference = await captureNativeReference(svgViewportLengthValues, 0, {
		omitBackground: false,
	});
	const still = await renderStillOnWeb({
		composition: svgViewportLengthValues,
		frame: 0,
		inputProps: {},
		licenseKey: 'free-license',
		allowHtmlInCanvas: false,
	});
	const actual = await still.blob({format: 'png'});
	expect((await compareNativePixels(reference, actual)).mismatchedPixels).toBe(
		0,
	);
});
