import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import {
	turnSvgIntoDrawable,
	getSvgFontSnapshot,
} from '../drawing/turn-svg-into-drawable';
import {
	svgLocalConditionalFontGroups as groups,
	getLocalConditionalFontRules,
} from './fixtures/svg-local-conditional-font';
import {svgUseFontData} from './fixtures/svg-use-data-font';
import '../symbol-dispose';
import {createFontFailureRecorder} from './font-failure-recorder';
import {countNativePixels} from './native-reference';
let instance = 0;
const png = async (image: CanvasImageSource) => {
	const canvas = new OffscreenCanvas(300, 90);
	try {
		canvas.getContext('2d')!.drawImage(image, 0, 0);
		return await canvas.convertToBlob({type: 'image/png'});
	} finally {
		canvas.width = 0;
		canvas.height = 0;
	}
};

test.for(
	groups.flatMap((group) =>
		(['top-then-group', 'group-then-top'] as const).flatMap((order) =>
			[1].map((frame) => ({group, order, frame})),
		),
	),
)(
	'retains local $group.name $order frame$frame',
	async ({group, order, frame}, t) => {
		const failure = createFontFailureRecorder(t);
		const save = (blob: Blob, path: string) => failure.png(path, blob);
		await document.fonts.ready;
		const baselineFaces = Array.from(document.fonts);
		const urls = await svgUseFontData;
		const family = `local-conditional-${++instance}`;
		const nodes: SVGSVGElement[] = [];
		const create = (suffix: string, rules: (name: string) => string) => {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('width', '300');
			svg.setAttribute('height', '90');
			svg.style.cssText = 'display:block;background:white';
			svg.dataset.testid = `${family}-${suffix}`;
			const name = family + '-' + suffix;
			svg.innerHTML = `<style>${rules(name)}</style><rect width="300" height="90" fill="white"/><text x="${6 + frame * 3}" y="56" style='font: ${38 + frame * 2}px "${name}";fill:black'>Review font</text>`;
			document.body.appendChild(svg);
			nodes.push(svg);
			return svg;
		};

		const face = (name: string, index: number) =>
			`@font-face{font-family:"${name}";src:url("${urls[index]}");font-style:normal;font-weight:400}`;
		const source = create('source', (fontFamily) =>
			getLocalConditionalFontRules({
				family: fontFamily,
				urls,
				group,
				order,
				literal: null,
			}),
		);
		const a = create('A', (name) => face(name, 0));
		const b = create('B', (name) => face(name, 1));
		const prefix = `validation/svg-local-conditional-font/${server.browser}/${group.name}-${order}-${frame}`;
		try {
			const ownedFaces = Array.from(document.fonts).filter(
				(f) => !baselineFaces.includes(f),
			);
			await Promise.all(ownedFaces.map((f) => f.load()));
			await document.fonts.ready;
			for (const svg of nodes)
				await document.fonts.load(
					`${38 + frame * 2}px "${family}-${svg === source ? 'source' : svg === a ? 'A' : 'B'}"`,
					'Review font',
				);
			await document.fonts.ready;
			const originalMarkup = source.outerHTML;
			const originalRules = Array.from(
				source.querySelector('style')!.sheet!.cssRules,
				(r) => r.cssText,
			);
			const settledFaces = Array.from(document.fonts);
			const statuses = settledFaces.map((f) => f.status);
			const promises = settledFaces.map((f) => f.loaded);
			const {ready} = document.fonts;
			const snapshot = getSvgFontSnapshot(source);
			const drawable = await turnSvgIntoDrawable(source);
			const actual = await png(drawable);
			const repeat = await png(await turnSvgIntoDrawable(source));
			const literalA = await png(await turnSvgIntoDrawable(a));
			const literalB = await png(await turnSvgIntoDrawable(b));
			for (const [name, blob] of [
				['actual', actual],
				['repeat', repeat],
				['literalA', literalA],
				['literalB', literalB],
			] as const)
				await save(blob, `${prefix}-${name}.png`);
			const fontSetStable =
				Array.from(document.fonts).length === settledFaces.length &&
				Array.from(document.fonts).every(
					(f, i) =>
						f === settledFaces[i] &&
						f.status === statuses[i] &&
						f.loaded === promises[i],
				) &&
				document.fonts.ready === ready &&
				document.fonts.status === 'loaded';
			const sourceUntouched =
				source.outerHTML === originalMarkup &&
				JSON.stringify(
					Array.from(
						source.querySelector('style')!.sheet!.cssRules,
						(r) => r.cssText,
					),
				) === JSON.stringify(originalRules);
			const expectedB =
				(order === 'top-then-group'
					? group.expectedTopThenGroup
					: group.expectedGroupThenTop) === 'B';
			const expectedLiteral = expectedB ? literalB : literalA;
			const snapshotFaces = [
				{name: 'A', position: snapshot.cssFontRules.indexOf(urls[0])},
				{name: 'B', position: snapshot.cssFontRules.indexOf(urls[1])},
			]
				.filter((f) => f.position >= 0)
				.sort((first, second) => first.position - second.position)
				.map((f) => f.name);
			const expectedFaces =
				group.snapshot === 'none'
					? []
					: group.snapshot === 'A-only' || !group.active
						? ['A']
						: order === 'top-then-group'
							? ['A', 'B']
							: ['B', 'A'];
			const results = {
				actualLiteral: await countNativePixels(actual, expectedLiteral),
				actualRepeat: await countNativePixels(actual, repeat),
				distinguishing: await countNativePixels(literalA, literalB),
			};
			await failure.record(
				`${prefix}.json`,
				JSON.stringify(
					{
						group: group.name,
						order,
						frame,
						expectedB,
						cssFontRulesLength: snapshot.cssFontRules.length,
						sourceUntouched,
						fontSetStable,
						snapshotFaces,
						expectedFaces,
						results,
					},
					null,
					2,
				),
			);
			expect(snapshotFaces).toEqual(expectedFaces);
			expect(fontSetStable).toBe(true);
			expect(sourceUntouched).toBe(true);
			expect(await turnSvgIntoDrawable(source)).toBe(drawable);
			expect(results.distinguishing.mismatchedPixels).toBeGreaterThan(0);
			for (const name of ['actualLiteral', 'actualRepeat'] as const) {
				const result = results[name];
				expect(result.mismatchedPixels, name).toBe(0);
				expect(result.maxChannelDelta, name).toBe(0);
			}
		} catch (error) {
			const e = error instanceof Error ? error : new Error(String(error));
			await failure.record(
				`${prefix}-error.json`,
				JSON.stringify({name: e.name, message: e.message, stack: e.stack}),
			);
			throw error;
		} finally {
			for (const svg of nodes) svg.remove();
			const finalFaces = Array.from(document.fonts);
			const cleanup =
				finalFaces.length === baselineFaces.length &&
				finalFaces.every((f, i) => f === baselineFaces[i]);
			await failure.record(
				`${prefix}-cleanup.json`,
				JSON.stringify({
					sourceFacesRestored: cleanup,
					fontsStatus: document.fonts.status,
				}),
			);
			expect(cleanup).toBe(true);
		}
	},
);
