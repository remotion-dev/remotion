import {expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgTitledPersistentOrder} from './fixtures/svg-persistent-font-order';
import {compareNativePixels} from './native-reference';

test('replays final font order in DOM-empty CSSOM carriers', async () => {
	for (const firstRoboto of [false, true]) {
		const svgBlobs: Blob[] = [];
		const createObjectURL = URL.createObjectURL.bind(URL);
		const spy = vi.spyOn(URL, 'createObjectURL').mockImplementation((value) => {
			if (value instanceof Blob && value.type.startsWith('image/svg+xml'))
				svgBlobs.push(value);
			return createObjectURL(value);
		});
		let actual: Blob;
		try {
			actual = await (
				await renderStillOnWeb({
					licenseKey: 'free-license',
					composition: svgTitledPersistentOrder(
						'cssom-last',
						firstRoboto,
						false,
					),
					frame: 0,
					inputProps: {},
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		} finally {
			spy.mockRestore();
		}

		expect(svgBlobs).toHaveLength(1);
		const svg = new DOMParser().parseFromString(
			await svgBlobs[0].text(),
			'image/svg+xml',
		);
		const styles = Array.from(svg.querySelectorAll('style'));
		expect(styles).toHaveLength(2);
		const urls = styles.map((style) =>
			Array.from(
				style.textContent!.matchAll(/url\(["']?([^"')]+)["']?\)/g),
				(match) => match[1],
			),
		);
		expect(new Set(urls[0]).size).toBe(2);
		expect(new Set(urls[1]).size).toBe(2);
		expect(urls[1].at(-1)).toBe(urls[0].at(-1));
		const literal = await (
			await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: svgTitledPersistentOrder('cssom-last', firstRoboto, true),
				frame: 0,
				inputProps: {},
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		expect((await compareNativePixels(literal, actual)).mismatchedPixels).toBe(
			0,
		);
	}
});
