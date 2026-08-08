import {HtmlInCanvas, Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {createScaffold} from '../create-scaffold';
import {
	getMaxLayoutSubtreeCanvasDepth,
	getNestedPaintCycles,
	setForceDisableHtmlInCanvasForTesting,
	supportsNativeHtmlInCanvas,
	supportsNestedHtmlInCanvas,
} from '../html-in-canvas';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {nestedHtmlInCanvas} from './fixtures/nested-html-in-canvas';
import {testImage} from './utils';

setForceDisableHtmlInCanvasForTesting(false);

const makeLayoutSubtreeCanvas = () => {
	const canvas = document.createElement('canvas') as HTMLCanvasElement & {
		layoutSubtree?: boolean;
	};
	canvas.layoutSubtree = true;
	return canvas;
};

const siblingSentinelColors = Array.from({length: 24}, (_, index) => {
	return [
		32 + ((index * 47) % 192),
		32 + ((index * 83) % 192),
		32 + ((index * 131) % 192),
	] as const;
});

const siblingSentinelSize = 16;
const siblingSentinelColumns = 12;

const siblingHtmlInCanvas = {
	component: () => {
		return (
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${siblingSentinelColumns}, ${siblingSentinelSize}px)`,
				}}
			>
				{siblingSentinelColors.map((color) => (
					<HtmlInCanvas
						key={color.join('-')}
						width={siblingSentinelSize}
						height={siblingSentinelSize}
						onPaint={async ({canvas}) => {
							// Finish on a later rendering update so the root must wait for the
							// sibling paint instead of capturing its initial transparent bitmap.
							await new Promise<void>((resolve) =>
								requestAnimationFrame(() => resolve()),
							);
							const context = canvas.getContext('2d');
							if (!context) {
								throw new Error('Could not get sibling sentinel context');
							}

							context.reset();
							context.fillStyle = `rgb(${color.join(', ')})`;
							context.fillRect(0, 0, siblingSentinelSize, siblingSentinelSize);
						}}
					>
						<div />
					</HtmlInCanvas>
				))}
			</div>
		);
	},
	id: 'sibling-html-in-canvas',
	width: siblingSentinelColumns * siblingSentinelSize,
	height:
		Math.ceil(siblingSentinelColors.length / siblingSentinelColumns) *
		siblingSentinelSize,
	fps: 30,
	durationInFrames: 1,
} as const;

const getImageData = async (blob: Blob): Promise<ImageData> => {
	const bitmap = await createImageBitmap(blob);
	try {
		const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get rendered sibling context');
		}

		context.drawImage(bitmap, 0, 0);
		return context.getImageData(0, 0, bitmap.width, bitmap.height);
	} finally {
		bitmap.close();
	}
};

test('settles wide sibling HTML-in-canvas trees in parallel', () => {
	const root = document.createElement('div');
	for (let i = 0; i < 100; i++) {
		const wrapper = document.createElement('div');
		wrapper.appendChild(makeLayoutSubtreeCanvas());
		root.appendChild(wrapper);
	}

	const depth = getMaxLayoutSubtreeCanvasDepth(root);
	expect(depth).toBe(1);
	expect(getNestedPaintCycles(depth)).toBe(3);
});

test('retains two settling cycles per nested HTML-in-canvas level', () => {
	const root = document.createElement('div');
	const outer = makeLayoutSubtreeCanvas();
	const middle = makeLayoutSubtreeCanvas();
	const inner = makeLayoutSubtreeCanvas();
	root.appendChild(outer);
	outer.appendChild(middle);
	middle.appendChild(inner);

	const depth = getMaxLayoutSubtreeCanvasDepth(root);
	expect(depth).toBe(3);
	expect(getNestedPaintCycles(depth)).toBe(7);
});

test('uses the deepest branch for mixed HTML-in-canvas trees', () => {
	const root = document.createElement('div');
	const shallow = makeLayoutSubtreeCanvas();
	root.appendChild(shallow);

	const deepWrapper = document.createElement('section');
	const outer = makeLayoutSubtreeCanvas();
	const middleWrapper = document.createElement('div');
	const middle = makeLayoutSubtreeCanvas();
	const inner = makeLayoutSubtreeCanvas();
	root.appendChild(deepWrapper);
	deepWrapper.appendChild(outer);
	outer.appendChild(middleWrapper);
	middleWrapper.appendChild(middle);
	middle.appendChild(inner);

	for (let i = 0; i < 20; i++) {
		root.appendChild(makeLayoutSubtreeCanvas());
	}

	const depth = getMaxLayoutSubtreeCanvasDepth(root);
	expect(depth).toBe(3);
	expect(getNestedPaintCycles(depth)).toBe(7);
});

test('captures every async sibling HTML-in-canvas after three settling cycles', async () => {
	const supportsNesting = await supportsNestedHtmlInCanvas();
	if (!supportsNesting) {
		return;
	}

	const rendered = await renderStillOnWeb({
		composition: siblingHtmlInCanvas,
		frame: 0,
		inputProps: {},
		licenseKey: 'free-license',
	});
	const imageData = await getImageData(await rendered.blob({format: 'png'}));

	for (let index = 0; index < siblingSentinelColors.length; index++) {
		const column = index % siblingSentinelColumns;
		const row = Math.floor(index / siblingSentinelColumns);
		const x = column * siblingSentinelSize + siblingSentinelSize / 2;
		const y = row * siblingSentinelSize + siblingSentinelSize / 2;
		const pixelOffset = (y * imageData.width + x) * 4;
		const actual = Array.from(
			imageData.data.slice(pixelOffset, pixelOffset + 4),
		);
		expect(actual, `sibling ${index}`).toEqual([
			...siblingSentinelColors[index],
			255,
		]);
	}
});

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

test('keeps a scaffold without HTML-in-canvas hidden', () => {
	const scaffold = createScaffold({
		Component: () => null,
		audioEnabled: false,
		defaultCodec: null,
		defaultOutName: null,
		delayRenderTimeoutInMilliseconds: 30_000,
		durationInFrames: 1,
		fps: 30,
		height: 100,
		id: 'html-in-canvas-scaffold-visibility',
		initialFrame: 0,
		logLevel: 'error',
		mediaCacheSizeInBytes: null,
		pixelDensity: 1,
		resolvedProps: {},
		schema: null,
		useHtmlInCanvas: false,
		videoEnabled: false,
		width: 100,
	});

	try {
		expect(getComputedStyle(scaffold.div.parentElement!).visibility).toBe(
			'hidden',
		);
		expect(getComputedStyle(scaffold.div.parentElement!).filter).toBe(
			'opacity(0)',
		);
		expect(getComputedStyle(scaffold.div).visibility).toBe('hidden');
	} finally {
		scaffold[Symbol.dispose]();
	}
});

test('keeps the DOM composer scaffold paintable', () => {
	const scaffold = createScaffold({
		Component: () => (
			<canvas
				ref={(node) => {
					if (node) {
						(
							node as HTMLCanvasElement & {layoutSubtree?: boolean}
						).layoutSubtree = true;
					}
				}}
			/>
		),
		audioEnabled: false,
		defaultCodec: null,
		defaultOutName: null,
		delayRenderTimeoutInMilliseconds: 30_000,
		durationInFrames: 1,
		fps: 30,
		height: 100,
		id: 'html-in-canvas-scaffold-visibility',
		initialFrame: 0,
		logLevel: 'error',
		mediaCacheSizeInBytes: null,
		pixelDensity: 1,
		resolvedProps: {},
		schema: null,
		useHtmlInCanvas: false,
		videoEnabled: false,
		width: 100,
	});

	try {
		expect(getComputedStyle(scaffold.div.parentElement!).visibility).toBe(
			'hidden',
		);
		expect(getComputedStyle(scaffold.div.parentElement!).filter).toBe(
			'opacity(0)',
		);
		expect(getComputedStyle(scaffold.div).visibility).toBe('visible');
	} finally {
		scaffold[Symbol.dispose]();
	}
});

test('uses the DOM composer when native HTML-in-canvas does not support nesting', async () => {
	if (!supportsNativeHtmlInCanvas()) {
		return;
	}

	setForceDisableHtmlInCanvasForTesting(true);
	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const result = await renderStillOnWeb({
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

		const blob = await result.blob({format: 'png'});
		await testImage({blob, testId: 'nested-html-in-canvas'});
	} finally {
		setForceDisableHtmlInCanvasForTesting(false);
		warn.mockRestore();
	}
});
