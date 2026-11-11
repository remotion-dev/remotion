import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {getSvgFontSnapshot} from '../drawing/turn-svg-into-drawable';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgNoUseChart} from './fixtures/svg-no-use-chart';
import {captureNativeReference, compareNativePixels} from './native-reference';
test('does not read geometric styles when capturing fonts without SVG use instances', () => {
	const host = document.createElement('div');
	document.body.appendChild(host);
	const root = createRoot(host);
	const Component = svgNoUseChart.component;
	let spy: ReturnType<typeof vi.spyOn> | null = null;
	try {
		flushSync(() => root.render(<Component />));
		const svg = host.querySelector('svg')!;
		expect(svg.querySelectorAll('path')).toHaveLength(10000);
		const original = window.getComputedStyle.bind(window);
		let geometryReads = 0;
		spy = vi
			.spyOn(window, 'getComputedStyle')
			.mockImplementation((element, pseudo) => {
				if (element.localName === 'path') geometryReads++;
				return original(element, pseudo);
			});
		getSvgFontSnapshot(svg);
		getSvgFontSnapshot(svg);
		expect(geometryReads).toBe(0);
	} finally {
		spy?.mockRestore();
		root.unmount();
		host.remove();
	}
});
test('retains the native pixels of a ten-thousand-path chart without SVG use instances', async () => {
	const reference = await captureNativeReference(svgNoUseChart, 0, {
		omitBackground: false,
	});
	const actual = await (
		await renderStillOnWeb({
			composition: svgNoUseChart,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
			allowHtmlInCanvas: false,
		})
	).blob({format: 'png'});
	const result = await compareNativePixels(reference, actual);
	expect(result.mismatchedPixels).toBe(0);
	expect(result.maxChannelDelta).toBe(0);
});
