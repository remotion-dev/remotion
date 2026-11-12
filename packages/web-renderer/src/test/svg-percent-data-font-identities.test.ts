import {expect, test} from 'vitest';
import {fingerprintCssFontGroups} from '../drawing/fingerprint-css-font-groups';
import {
	svgPercentDataFontEncodings,
	svgPercentDataFontUrls,
} from './fixtures/svg-percent-data-font';
import {svgUseFontData} from './fixtures/svg-use-data-font';
const variants = svgPercentDataFontEncodings.flatMap((encoding) =>
	(['A', 'B'] as const).map((preferred) => ({encoding, preferred})),
);
test.for(variants)(
	'keeps $encoding titled $preferred source font identities',
	async ({encoding, preferred}) => {
		const urls = await svgPercentDataFontUrls(encoding);
		const originals = await svgUseFontData;
		for (const [index, url] of urls.entries()) {
			const actual = new Uint8Array(await (await fetch(url)).arrayBuffer());
			const expected = new Uint8Array(
				await (await fetch(originals[index])).arrayBuffer(),
			);
			expect(actual).toEqual(expected);
		}

		const iframe = document.createElement('iframe');
		document.body.append(iframe);
		const owner = iframe.contentDocument!;
		const ownerWindow = owner.defaultView!;
		const preferredSheet = owner.createElement('style');
		preferredSheet.title = preferred;
		preferredSheet.textContent = '/* Preferred font set. */';
		owner.head.append(preferredSheet);
		const family = 'Percent source ' + crypto.randomUUID();
		const svg = owner.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.innerHTML =
			(['A', 'B'] as const)
				.map(
					(title, index) =>
						`<style title="${title}">@font-face{font-family:"${family}";src:url("${urls[index]}")}</style>`,
				)
				.join('') +
			`<text style="font-family:&quot;${family}&quot;;font-size:36px">Review font</text>`;
		owner.body.append(svg);
		try {
			expect(
				(await owner.fonts.load(`36px "${family}"`)).length,
			).toBeGreaterThan(0);
			await owner.fonts.ready;
			const faces = Array.from(owner.fonts);
			const promises = faces.map((face) => face.loaded);
			const statuses = faces.map((face) => face.status);
			const {ready} = owner.fonts;
			const markup = svg.outerHTML;
			const styles = Array.from(svg.querySelectorAll('style'));
			const rules = styles.map((style) =>
				Array.from(style.sheet!.cssRules, (rule) => rule.cssText),
			);
			const text = svg.querySelector('text')!;
			const result = fingerprintCssFontGroups(
				owner,
				[
					{
						text: text.textContent!,
						style: ownerWindow.getComputedStyle(text),
						lang: '',
					},
				],
				styles.map((style) => ({
					name: style.title,
					rules: Array.from(style.sheet!.cssRules) as CSSFontFaceRule[],
				})),
			);
			expect(result.matches).toEqual([preferred]);
			expect(result.reason).toBeNull();
			const after = Array.from(owner.fonts);
			expect(after.length).toBe(faces.length);
			for (const [index, face] of after.entries()) {
				expect(face).toBe(faces[index]);
				expect(face.loaded).toBe(promises[index]);
				expect(face.status).toBe(statuses[index]);
			}

			expect(owner.fonts.ready).toBe(ready);
			expect(owner.fonts.status).toBe('loaded');
			expect(svg.outerHTML).toBe(markup);
			expect(
				styles.map((style) =>
					Array.from(style.sheet!.cssRules, (rule) => rule.cssText),
				),
			).toEqual(rules);
		} finally {
			iframe.remove();
		}
	},
);
