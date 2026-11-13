import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {renderFramesOnWeb} from '../render-still-on-web';
import {svgFontCaptureReadiness} from './fixtures/svg-font-capture-readiness';
import {compareNativePixels} from './native-reference';

// This tests pending SDK readiness against the same export after its font has
// loaded. Native SVG glyph parity is a separate renderer contract.
test('waits for SDK font fetches before exporting every SVG frame', async () => {
	const fixture = svgFontCaptureReadiness();
	let release!: () => void;
	const permission = new Promise<void>((resolve) => {
		release = resolve;
	});
	let entered!: () => void;
	const fetching = new Promise<void>((resolve) => {
		entered = resolve;
	});
	const fetchFont = NoReactInternals.fetchFontData;
	const fetchSpy = vi
		.spyOn(NoReactInternals, 'fetchFontData')
		.mockImplementation(async (url) => {
			if (url === fixture.fontUrl) {
				entered();
				await permission;
			}

			return fetchFont(url);
		});
	const registered = NoReactInternals.getRegisteredFontFaces;
	const reads: {size: string; loaded: number}[] = [];
	const sourceFaces = () =>
		[...document.fonts].filter(
			(face) => face.family.replace(/^(['"])(.*)\1$/, '$2') === fixture.family,
		);
	const readSpy = vi
		.spyOn(NoReactInternals, 'getRegisteredFontFaces')
		.mockImplementation(() => {
			const svg = document.querySelector(
				`svg[data-capture-readiness="${fixture.family}"]`,
			);
			if (svg)
				reads.push({
					size: getComputedStyle(svg.querySelector('text')!).fontSize,
					loaded: sourceFaces().filter((face) => face.status === 'loaded')
						.length,
				});
			return registered();
		});
	const render = () =>
		renderFramesOnWeb({
			composition: fixture.composition,
			frames: [0, 1, 2],
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		});
	const first = render();
	let finished = false;
	first.then(
		() => {
			finished = true;
		},
		() => {
			finished = true;
		},
	);
	try {
		await fetching;
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);
		expect(reads).toEqual([]);
		expect(finished).toBe(false);
		release();
		const frames = await first;
		const [face] = sourceFaces();
		expect(sourceFaces()).toHaveLength(1);
		const {loaded} = face;
		const {ready} = document.fonts;
		const repeated = await render();
		expect(reads.map((read) => read.size)).toEqual([
			'28px',
			'34px',
			'40px',
			'28px',
			'34px',
			'40px',
		]);
		for (const read of reads) expect(read.loaded).toBe(1);
		for (let index = 0; index < frames.length; index++) {
			const actual = await frames[index].blob({format: 'png'});
			const expected = await repeated[index].blob({format: 'png'});
			expect(
				(await compareNativePixels(actual, expected)).mismatchedPixels,
			).toBe(0);
		}

		expect(document.fonts.has(face)).toBe(true);
		expect(face.status).toBe('loaded');
		expect(face.loaded).toBe(loaded);
		expect(document.fonts.ready).toBe(ready);
	} finally {
		release();
		await first.catch(() => undefined);
		fetchSpy.mockRestore();
		readSpy.mockRestore();
		for (const face of sourceFaces()) document.fonts.delete(face);
	}
});
