import {expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgExactTitleFont} from './fixtures/svg-exact-title-font';

test('keeps whitespace-distinct stylesheet font titles independent', async () => {
	const svgBlobs: Blob[] = [];
	const createObjectURL = URL.createObjectURL.bind(URL);
	const spy = vi.spyOn(URL, 'createObjectURL').mockImplementation((value) => {
		if (value instanceof Blob && value.type.startsWith('image/svg+xml')) {
			svgBlobs.push(value);
		}

		return createObjectURL(value);
	});
	try {
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: svgExactTitleFont({
				title: 'A',
				inactiveTitle: ' A ',
				firstRoboto: false,
				literal: false,
			}),
			frame: 0,
			inputProps: {},
			allowHtmlInCanvas: false,
		});
	} finally {
		spy.mockRestore();
	}

	expect(svgBlobs).toHaveLength(1);
	const svg = new DOMParser().parseFromString(
		await svgBlobs[0].text(),
		'image/svg+xml',
	);
	const sources = (title: string) => {
		const style = Array.from(svg.querySelectorAll('style')).find(
			(element) => element.getAttribute('title') === title,
		);
		expect(style).toBeDefined();
		return new Set(
			Array.from(
				style!.textContent!.matchAll(/url\(["']?([^"')]+)["']?\)/g),
				(match) => match[1],
			),
		);
	};

	const active = sources('A');
	const inactive = sources(' A ');
	expect(active.size).toBe(1);
	expect(inactive.size).toBe(1);
	expect([...active][0]).not.toBe([...inactive][0]);
});
