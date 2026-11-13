import {expect, test} from 'vitest';
import {getEmbeddedFontStyleForSvg} from '../drawing/embed-registered-fonts-in-svg';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import '../symbol-dispose';
import {
	registeredCdataMarkup,
	registeredCdataNodes,
	registeredCdataReady,
	registeredCdataWrappers,
	svgRegisteredCdataFont,
} from './fixtures/svg-registered-cdata-font';
import {testCompositions} from './utils';

test('renders registered fonts in text, CDATA and mixed nodes', async () => {
	await testCompositions({
		cases: registeredCdataWrappers.map((wrapper, index) => ({
			composition: svgRegisteredCdataFont(
				wrapper,
				registeredCdataNodes[index],
				'registered',
			),
			frame: 1,
		})),
		columns: 3,
		testId: 'svg-registered-cdata-fonts',
	});
});

test.for(registeredCdataWrappers.map((wrapper) => ({wrapper})))(
	'preserves source nodes styles faces and cache for $wrapper CDATA',
	async ({wrapper}) => {
		await registeredCdataReady;
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
