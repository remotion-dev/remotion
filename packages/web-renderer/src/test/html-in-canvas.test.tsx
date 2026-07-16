import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {
	supportsNativeHtmlInCanvas,
	supportsNestedHtmlInCanvas,
} from '../html-in-canvas';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {nestedHtmlInCanvas} from './fixtures/nested-html-in-canvas';
import {testImage} from './utils';

test('captures three nested HTML-in-canvas effect layers natively', async () => {
	const supportsNesting = await supportsNestedHtmlInCanvas();
	if (!supportsNesting) {
		return;
	}

	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const nested = await renderStillOnWeb({
			allowHtmlInCanvas: true,
			composition: nestedHtmlInCanvas,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		const blob = await nested.blob({format: 'png'});

		expect(
			warn.mock.calls.some((call) =>
				call.some(
					(value) =>
						typeof value === 'string' &&
						value.includes('Using Chromium experimental HTML-in-canvas'),
				),
			),
		).toBe(true);

		await testImage({blob, testId: 'nested-html-in-canvas'});
	} finally {
		warn.mockRestore();
	}
});

test('falls back when native HTML-in-canvas does not support nesting', async () => {
	if (!supportsNativeHtmlInCanvas() || (await supportsNestedHtmlInCanvas())) {
		return;
	}

	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		await renderStillOnWeb({
			allowHtmlInCanvas: true,
			composition: nestedHtmlInCanvas,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});

		expect(
			warn.mock.calls.some((call) =>
				call.some(
					(value) =>
						typeof value === 'string' &&
						value.includes(
							'Nested HTML-in-canvas capture requires Chromium 152.0.7944.0 or later',
						),
				),
			),
		).toBe(true);
	} finally {
		warn.mockRestore();
	}
});
