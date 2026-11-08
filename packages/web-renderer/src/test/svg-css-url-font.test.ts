import {NoReactInternals} from 'remotion/no-react';
import {expect, test, vi} from 'vitest';
import {turnSvgIntoDrawable} from '../drawing/turn-svg-into-drawable';
import '../symbol-dispose';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgCssUrlFont} from './fixtures/svg-css-url-font';
import {
	captureNativeReference,
	compareNativePixels,
	savePixelEvidence,
} from './native-reference';

test.for([0, 1])(
	'CSS URL font matches native frame %i (KINO-7769)',
	async (frame, t) => {
		if (t.task.file.projectName !== 'chromium') {
			t.skip();
			return;
		}

		const reference = await captureNativeReference(svgCssUrlFont, frame);
		const actual = await (
			await renderStillOnWeb({
				composition: svgCssUrlFont,
				frame,
				inputProps: {},
				licenseKey: 'free-license',
				allowHtmlInCanvas: false,
			})
		).blob({format: 'png'});
		const result = await compareNativePixels(reference, actual);
		await savePixelEvidence(reference, `css-url-font-${frame}-native`);
		await savePixelEvidence(actual, `css-url-font-${frame}-actual`);
		await savePixelEvidence(result.diff, `css-url-font-${frame}-diff`);
		expect(result.mismatchedPixels).toBe(0);
	},
);

// KINO-7769: Font fetching must not retain mounted mutations or poison a retry.
test('CSS URL font fetch restores SVG styles, deduplicates and retries', async (t) => {
	if (t.task.file.projectName !== 'chromium') {
		t.skip();
		return;
	}

	const url = new URL('../../../example/public/bangers.woff2', import.meta.url)
		.href;
	const fontData = await (await fetch(url)).arrayBuffer();
	const style = document.createElement('style');
	style.textContent = `@font-face{font-family:"CSS URL async guard";src:url("${url}") format("woff2")}`;
	document.head.appendChild(style);
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute(
		'style',
		'position:absolute;transform:translateX(3px);width:320px;height:100px',
	);
	svg.innerHTML =
		'<text x="10" y="40" style="font-family:CSS URL async guard;font-size:40px">Async font</text>';
	document.body.appendChild(svg);
	let rejectFetch!: (error: Error) => void;
	try {
		await document.fonts.load('40px "CSS URL async guard"');
		const originalStyle = svg.getAttribute('style');
		const deferred = new Promise<ArrayBuffer>((_resolve, reject) => {
			rejectFetch = reject;
		});
		const fetchFont = vi
			.spyOn(NoReactInternals, 'fetchFontData')
			.mockReturnValueOnce(deferred)
			.mockResolvedValue(fontData);
		try {
			const pending = turnSvgIntoDrawable(svg);
			expect(svg.getAttribute('style')).toBe(originalStyle);
			expect(turnSvgIntoDrawable(svg)).toBe(pending);
			expect(fetchFont).toHaveBeenCalledTimes(1);
			const failure = expect(pending).rejects.toThrow(
				'transient CSS font fetch',
			);
			rejectFetch(new Error('transient CSS font fetch'));
			await failure;
			const retry = turnSvgIntoDrawable(svg);
			expect(retry).not.toBe(pending);
			await retry;
			expect(fetchFont).toHaveBeenCalledTimes(2);
			expect(svg.getAttribute('style')).toBe(originalStyle);
		} finally {
			rejectFetch(new Error('transient CSS font fetch'));
			fetchFont.mockRestore();
		}
	} finally {
		svg.remove();
		style.remove();
	}
});
