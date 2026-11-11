import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {getSvgFontSnapshot} from '../drawing/turn-svg-into-drawable';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgRepeatedUse} from './fixtures/svg-repeated-use';
import {svgUseFontData, svgUseFontFamilies} from './fixtures/svg-use-data-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

test(
	'visits shared geometry once per font snapshot for a thousand use instances',
	{timeout: 90000},
	async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const root = createRoot(host);
		const Component = svgRepeatedUse.component;
		let spy: ReturnType<typeof vi.spyOn> | null = null;
		try {
			flushSync(() => root.render(<Component />));
			const svg = host.querySelector('svg')!;
			expect(svg.querySelectorAll('use')).toHaveLength(1000);
			expect(svg.querySelectorAll('path')).toHaveLength(1000);
			const original = Element.prototype.matches;
			let geometryVisits = 0;
			spy = vi
				.spyOn(Element.prototype, 'matches')
				.mockImplementation(function (this: Element, selector) {
					if (this.localName === 'path' && selector === 'text, tspan, textPath')
						geometryVisits++;
					return original.call(this, selector);
				});
			getSvgFontSnapshot(svg);
			getSvgFontSnapshot(svg);
			await server.commands.writeFile(
				`validation/svg-repeated-use/${server.browser}/traversal.json`,
				JSON.stringify({
					geometryVisits,
					snapshotCalls: 2,
					paths: 1000,
					uses: 1000,
				}),
			);
			expect(geometryVisits).toBe(2000);
		} finally {
			spy?.mockRestore();
			root.unmount();
			host.remove();
		}
	},
);

test(
	'retains native pixels for a thousand instances of a thousand-path template',
	{timeout: 90000},
	async () => {
		const reference = await captureNativeReference(svgRepeatedUse, 0, {
			omitBackground: false,
			screenshotTimeout: 90000,
		});
		const actual = await (
			await renderStillOnWeb({
				composition: svgRepeatedUse,
				frame: 0,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		for (const [name, blob] of [
			['native', reference],
			['actual', actual],
			['diff', result.diff],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-repeated-use/${server.browser}/${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		expect(result.mismatchedPixels).toBe(0);
		expect(result.maxChannelDelta).toBe(0);
	},
);

test.for(['nested', 'cyclic-text', 'cyclic-geometry', 'text-context'] as const)(
	'keeps use text discovery correct for %s',
	async (mode) => {
		const [data] = await svgUseFontData;
		const family = svgUseFontFamilies[0];
		const style = document.createElement('style');
		style.textContent = `@font-face{font-family:"${family}";src:url("${data}")}`;
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const content =
			mode === 'cyclic-geometry'
				? '<path d="M0 0h1v1Z"/>'
				: '<text>Label</text>';
		svg.innerHTML =
			mode === 'text-context'
				? `<defs><a id="shared">Label</a><g id="template"><use href="#shared"/><text><use href="#shared"/></text></g></defs><text font-size="0">Snapshot trigger</text><use href="#template" style="font-family:${family}"/>`
				: `<defs><g id="leaf">${content}</g><g id="template">${mode.startsWith('cyclic') ? '<use href="#template"/>' : ''}<use href="#leaf"/></g></defs><text font-size="0">Snapshot trigger</text><use href="#template" style="font-family:${family}"/>`;
		document.head.appendChild(style);
		document.body.appendChild(svg);
		try {
			const snapshot = getSvgFontSnapshot(svg);
			if (mode === 'cyclic-geometry') expect(snapshot.cssFontRules).toBe('');
			else expect(snapshot.cssFontRules).toContain(family);
			// A new snapshot must not reuse a positive answer after DOM mutation.
			svg
				.querySelectorAll('defs text, defs a')
				.forEach((element) => element.remove());
			expect(getSvgFontSnapshot(svg).cssFontRules).toBe('');
		} finally {
			svg.remove();
			style.remove();
		}
	},
);

test('does not cache a positive result for a dead branch visited before text', async () => {
	const [data] = await svgUseFontData;
	const [primary, geometryOnly] = svgUseFontFamilies;
	const style = document.createElement('style');
	style.textContent = svgUseFontFamilies
		.map((family) => `@font-face{font-family:"${family}";src:url("${data}")}`)
		.join('');
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.innerHTML = `<defs><g id="dead"><path d="M0 0h1v1Z"/></g><g id="live"><use href="#dead"/><text>Label</text></g></defs><use href="#live" style="font-family:${primary}"/><use href="#dead" style="font-family:${geometryOnly}"/>`;
	document.head.appendChild(style);
	document.body.appendChild(svg);
	try {
		const snapshot = getSvgFontSnapshot(svg);
		expect(snapshot.cssFontRules).toContain(primary);
		expect(snapshot.cssFontRules).not.toContain(geometryOnly);
	} finally {
		svg.remove();
		style.remove();
	}
});
