import {expect, test, vi} from 'vitest';
import {page, server} from 'vitest/browser';
import {svgInactiveTitledFont} from './fixtures/svg-inactive-titled-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

test('captures committed cold large-font native content before screenshotting', async () => {
	const faceIds = new WeakMap<FontFace, number>();
	const promiseIds = new WeakMap<Promise<FontFace>, number>();
	let nextFace = 0;
	let nextPromise = 0;
	const fonts = () =>
		Array.from(document.fonts, (face) => {
			if (!faceIds.has(face)) faceIds.set(face, ++nextFace);
			if (!promiseIds.has(face.loaded))
				promiseIds.set(face.loaded, ++nextPromise);
			return {
				id: faceIds.get(face),
				promise: promiseIds.get(face.loaded),
				family: face.family,
				status: face.status,
			};
		});
	const cold = fonts();
	const beforeScreenshots: {
		id: string;
		textCount: number;
		text: string | null;
		fonts: ReturnType<typeof fonts>;
		setStatus: FontFaceSet['status'];
	}[] = [];
	const originalLocator = page.getByTestId.bind(page);
	const locator = vi
		.spyOn(page, 'getByTestId')
		.mockImplementation((...args) => {
			const result = originalLocator(...args);
			return new Proxy(result, {
				get(target, property, receiver) {
					if (property === 'screenshot')
						return (...options: Parameters<typeof result.screenshot>) => {
							const host = Array.from(
								document.querySelectorAll<HTMLElement>('[data-testid]'),
							).find((element) => element.dataset.testid === args[0])!;
							beforeScreenshots.push({
								id: String(args[0]),
								textCount: host.querySelectorAll('text').length,
								text: host.querySelector('text')?.textContent ?? null,
								fonts: fonts(),
								setStatus: document.fonts.status,
							});
							return target.screenshot(...options);
						};

					return Reflect.get(target, property, receiver);
				},
			});
		});
	const images = new Map<string, Blob>();
	const comparisons: Record<string, number> = {};
	try {
		const capture = async (
			name: string,
			literalMode: boolean,
			fallbackMode: boolean,
		) => {
			const image = await captureNativeReference(
				svgInactiveTitledFont({
					mode: 'large',
					literal: literalMode,
					fallback: fallbackMode,
				}),
				0,
				{omitBackground: false},
			);
			images.set(name, image);
			return image;
		};

		const first = await capture('first-cold-source', false, false);
		const afterFirst = fonts();
		const literal = await capture('literal', true, false);
		const second = await capture('second-source', false, false);
		const fallback = await capture('fallback', true, true);
		const difference = await compareNativePixels(first, literal);
		images.set('first-vs-literal-diff', difference.diff);
		comparisons.firstVsLiteral = difference.mismatchedPixels;
		comparisons.firstVsSecond = (
			await compareNativePixels(first, second)
		).mismatchedPixels;
		comparisons.literalVsFallback = (
			await compareNativePixels(literal, fallback)
		).mismatchedPixels;
		const afterAll = fonts();
		const base =
			'validation/native-large-font-reference-readiness/' +
			server.browser +
			'/';
		for (const [name, image] of images) {
			let binary = '';
			for (const byte of new Uint8Array(await image.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				base + name + '.png',
				btoa(binary),
				'base64',
			);
		}

		await server.commands.writeFile(
			base + 'phases.json',
			JSON.stringify(
				{cold, beforeScreenshots, afterFirst, afterAll, comparisons},
				null,
				2,
			),
		);
		expect(
			cold.some(
				(face) => face.family.replace(/^"|"$/g, '') === 'Large titled font',
			),
		).toBe(false);
		expect(beforeScreenshots).toHaveLength(4);
		for (const record of beforeScreenshots) {
			expect(record.textCount).toBe(1);
			expect(record.text).toBe('Titled carrier font');
			expect(record.setStatus).toBe('loaded');
			expect(
				record.fonts.some(
					(face) =>
						face.family.replace(/^"|"$/g, '') === 'Large titled font' &&
						face.status === 'loaded',
				),
			).toBe(true);
		}

		expect(afterAll).toEqual(afterFirst);
		expect(comparisons.firstVsLiteral).toBe(0);
		expect(comparisons.firstVsSecond).toBe(0);
		expect(comparisons.literalVsFallback).toBeGreaterThan(0);
	} finally {
		locator.mockRestore();
	}
});
