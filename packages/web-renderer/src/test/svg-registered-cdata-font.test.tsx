import {beforeAll, expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {getEmbeddedFontStyleForSvg} from '../drawing/embed-registered-fonts-in-svg';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import '../symbol-dispose';
import {
	registeredCdataMarkup,
	registeredCdataNodes,
	registeredCdataReady,
	registeredCdataWrappers,
} from './fixtures/svg-registered-cdata-font';
import {
	measureRegisteredCdata,
	registeredCdataCases,
} from './svg-registered-cdata-font-cases';

beforeAll(async () => {
	await registeredCdataReady;
});

test.for(registeredCdataCases)(
	'embeds registered fonts for $wrapper CDATA frame$frame',
	async (c) => {
		const {images, comparisons} = await measureRegisteredCdata(c);
		const asserted = [
			'nativeNodes',
			'nativeLiteral',
			'nativeRepeat',
			'actualNodes',
			'actualMixed',
			'actualLiteral',
			'actualRepeat',
		] as const;
		if (
			asserted.some((key) => comparisons[key].mismatchedPixels !== 0) ||
			comparisons.fallbackDifference.mismatchedPixels === 0
		) {
			for (const [key, blob] of Object.entries(images)) {
				let binary = '';
				for (const byte of new Uint8Array(await blob.arrayBuffer()))
					binary += String.fromCharCode(byte);
				await server.commands.writeFile(
					`src/test/__screenshots__/native-pixel-failures/svg-registered-cdata/${server.browser}/${c.wrapper}-${c.frame}-${key}.png`,
					btoa(binary),
					'base64',
				);
			}

			await server.commands.writeFile(
				`src/test/__screenshots__/native-pixel-failures/svg-registered-cdata/${server.browser}/${c.wrapper}-${c.frame}.json`,
				JSON.stringify(comparisons, null, 2),
			);
		}

		for (const key of asserted) {
			const value = comparisons[key];
			expect(value.mismatchedPixels, key).toBe(0);
			expect(value.maxChannelDelta, key).toBe(0);
		}

		expect(comparisons.fallbackDifference.mismatchedPixels).toBeGreaterThan(0);
	},
);

test.for(registeredCdataWrappers.map((wrapper) => ({wrapper})))(
	'preserves source nodes styles faces and cache for $wrapper CDATA',
	async ({wrapper}) => {
		const svg = (nodes: 'text' | 'cdata' | 'mixed') =>
			new DOMParser().parseFromString(
				registeredCdataMarkup(wrapper, nodes, 0, 'registered'),
				'image/svg+xml',
			).documentElement as unknown as SVGSVGElement;
		const originals = registeredCdataNodes.map(svg);
		const host = document.createElement('div');
		host.append(...originals);
		document.body.append(host);
		try {
			const markup = originals.map((node) =>
				new XMLSerializer().serializeToString(node),
			);
			const nodes = originals.map((node) =>
				Array.from(node.querySelectorAll('*')).flatMap((element) => [
					element,
					...element.childNodes,
				]),
			);
			const faces = Array.from(document.fonts);
			const loaded = faces.map((face) => face.loaded);
			const statuses = faces.map((face) => face.status);
			const sheets = Array.from(document.styleSheets);
			const styles = originals.map(getEmbeddedFontStyleForSvg);
			expect(styles[0]).not.toBeNull();
			for (const style of styles) {
				expect(style).toBe(styles[0]);
				expect(style!.css.match(/@font-face/g)?.length).toBe(1);
			}

			for (let index = 0; index < originals.length; index++) {
				const element = originals[index];
				const pending = turnSvgIntoDrawable(element);
				expect(turnSvgIntoDrawable(element)).toBe(pending);
				await pending;
				const leaf = document
					.createTreeWalker(
						element,
						NodeFilter.SHOW_TEXT | NodeFilter.SHOW_CDATA_SECTION,
					)
					.nextNode() as CharacterData;
				const content = leaf.data;
				leaf.data = 'Wave';
				const changed = turnSvgIntoDrawable(element);
				expect(changed).not.toBe(pending);
				await changed;
				leaf.data = content;
				const restored = turnSvgIntoDrawable(element);
				expect(restored).not.toBe(changed);
				await restored;
				expect(new XMLSerializer().serializeToString(element)).toBe(
					markup[index],
				);
				const after = Array.from(element.querySelectorAll('*')).flatMap(
					(child) => [child, ...child.childNodes],
				);
				expect(after.length).toBe(nodes[index].length);
				after.forEach((node, i) => expect(node).toBe(nodes[index][i]));
			}

			const afterFaces = Array.from(document.fonts);
			expect(afterFaces.length).toBe(faces.length);
			afterFaces.forEach((face, index) => {
				expect(face).toBe(faces[index]);
				expect(face.loaded).toBe(loaded[index]);
				expect(face.status).toBe(statuses[index]);
			});
			const afterSheets = Array.from(document.styleSheets);
			expect(afterSheets.length).toBe(sheets.length);
			afterSheets.forEach((sheet, index) => expect(sheet).toBe(sheets[index]));
		} finally {
			host.remove();
		}
	},
);
