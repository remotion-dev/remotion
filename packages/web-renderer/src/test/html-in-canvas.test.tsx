import {Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {
	supportsNativeHtmlInCanvas,
	supportsNestedHtmlInCanvas,
} from '../html-in-canvas';
import {renderMediaOnWeb} from '../render-media-on-web';
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

test('captures three nested HTML-in-canvas effect layers across video frames', async () => {
	const supportsNesting = await supportsNestedHtmlInCanvas();
	if (!supportsNesting) {
		return;
	}

	await renderMediaOnWeb({
		composition: nestedHtmlInCanvas,
		inputProps: {},
		licenseKey: 'free-license',
		muted: true,
	});
});

test('retries a transient missing nested paint record during a client-side render', async () => {
	const supportsNesting = await supportsNestedHtmlInCanvas();
	if (!supportsNesting) {
		return;
	}

	const descriptor = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'captureElementImage',
	);
	if (!descriptor || typeof descriptor.value !== 'function') {
		throw new Error('Expected captureElementImage() to be available');
	}

	const originalCapture = descriptor.value as (
		this: HTMLCanvasElement,
		element: Element,
	) => ElementImage;
	let simulatedMissingRecord = false;

	Object.defineProperty(HTMLCanvasElement.prototype, 'captureElementImage', {
		...descriptor,
		value(this: HTMLCanvasElement, element: Element) {
			const ancestorCanvas = this.parentElement?.closest('canvas');
			if (!simulatedMissingRecord && ancestorCanvas) {
				simulatedMissingRecord = true;
				throw new DOMException(
					'No cached paint record for element',
					'InvalidStateError',
				);
			}

			return originalCapture.call(this, element);
		},
	});

	try {
		await renderMediaOnWeb({
			composition: nestedHtmlInCanvas,
			inputProps: {},
			licenseKey: 'free-license',
			muted: true,
		});
	} finally {
		Object.defineProperty(
			HTMLCanvasElement.prototype,
			'captureElementImage',
			descriptor,
		);
	}

	expect(simulatedMissingRecord).toBe(true);
});

test('uses the DOM composer when native HTML-in-canvas does not support nesting', async () => {
	if (!supportsNativeHtmlInCanvas() || (await supportsNestedHtmlInCanvas())) {
		return;
	}

	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		await renderStillOnWeb({
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
						value.includes('Using Chromium experimental HTML-in-canvas'),
				),
			),
		).toBe(false);
	} finally {
		warn.mockRestore();
	}
});
