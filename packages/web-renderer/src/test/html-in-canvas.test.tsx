import {Player} from '@remotion/player';
import {createRoot} from 'react-dom/client';
import {HtmlInCanvas, Internals} from 'remotion';
import {expect, test, vi} from 'vitest';
import {createScaffold} from '../create-scaffold';
import {supportsNativeHtmlInCanvas} from '../html-in-canvas';
import {makeInternalState} from '../internal-state';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {createLayer, type HtmlInCanvasLayerOutcome} from '../take-screenshot';
import {backgroundColor} from './fixtures/background-color';
import {htmlInCanvasBlur} from './fixtures/html-in-canvas-blur';
import {
	htmlInCanvasFrames,
	htmlInCanvasNestedFrames,
} from './fixtures/html-in-canvas-frames';

const readPixels = (
	source: CanvasImageSource,
	width: number,
	height: number,
) => {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = 'red';
	ctx.fillRect(0, 0, width, height);
	ctx.drawImage(source, 0, 0);
	return ctx.getImageData(0, 0, width, height).data;
};

const countDifferentPixels = (a: Uint8ClampedArray, b: Uint8ClampedArray) => {
	expect(a.length).toBe(b.length);
	let different = 0;
	for (let i = 0; i < a.length; i += 4) {
		if (
			a[i] !== b[i] ||
			a[i + 1] !== b[i + 1] ||
			a[i + 2] !== b[i + 2] ||
			a[i + 3] !== b[i + 3]
		) {
			different++;
		}
	}

	return different;
};

for (const allowHtmlInCanvas of [false, true]) {
	test(
		`captures nested custom paint and effects, native=${allowHtmlInCanvas}`,
		{timeout: 60_000},
		async (t) => {
			if (!HtmlInCanvas.isNestingSupported()) {
				t.skip();
				return;
			}

			let captured = 48;
			await renderMediaOnWeb({
				composition: htmlInCanvasNestedFrames,
				inputProps: {
					backend: '2d',
					preserveDrawingBuffer: false,
					mountAt: 50,
					pixelDensity: 2,
				},
				allowHtmlInCanvas,
				licenseKey: 'free-license',
				logLevel: 'error',
				frameRange: [48, 55],
				container: 'webm',
				videoCodec: 'vp9',
				hardwareAcceleration: 'prefer-software',
				muted: true,
				onFrame: (frame) => {
					const pixels = readPixels(frame, 100, 100);
					const color =
						captured < 50
							? [0, 0, 0, 255]
							: [255 - ((captured * 37 + 17) % 255), 255, 255, 255];
					const index = (10 * 100 + 10) * 4;
					// The invert filter can round a channel by one; a stale frame differs by 37.
					expect(
						Math.max(
							...color.map((value, channel) =>
								Math.abs(pixels[index + channel] - value),
							),
						),
						`nested frame ${captured}`,
					).toBeLessThanOrEqual(1);
					captured++;
					return frame;
				},
			});
			expect(captured).toBe(56);
		},
	);

	for (const backend of [
		'2d',
		'init-only',
		'incremental',
		'webgl',
		'webgl2',
		'webgpu',
	] as const) {
		for (const preserveDrawingBuffer of backend === 'webgl' ||
		backend === 'webgl2'
			? [false, true]
			: [false]) {
			for (const mountAt of [0, 50]) {
				test(
					`captures current custom ${backend} pixels at mount ${mountAt}, preserve=${preserveDrawingBuffer}, native=${allowHtmlInCanvas} (#12074)`,
					{timeout: 60_000},
					async (t) => {
						if (!supportsNativeHtmlInCanvas()) {
							t.skip();
							return;
						}

						const start = Math.max(0, mountAt - 2);
						let captured = start;
						await renderMediaOnWeb({
							composition: htmlInCanvasFrames,
							inputProps: {
								backend,
								preserveDrawingBuffer,
								mountAt,
								pixelDensity: 2,
							},
							allowHtmlInCanvas,
							licenseKey: 'free-license',
							logLevel: 'error',
							frameRange: [start, mountAt + 5],
							container: 'webm',
							videoCodec: 'vp9',
							hardwareAcceleration: 'prefer-software',
							muted: true,
							onFrame: (frame) => {
								const pixels = readPixels(frame, 100, 100);
								const color =
									captured < mountAt
										? [255, 255, 255, 255]
										: [(captured * 37 + 17) % 255, 0, 0, 255];
								const index = (10 * 100 + 10) * 4;
								expect(
									Array.from(pixels.slice(index, index + 4)),
									`frame ${captured}`,
								).toEqual(color);
								if (backend === 'incremental' && captured >= mountAt) {
									const retained = (10 * 100 + 50) * 4;
									expect(
										Array.from(pixels.slice(retained, retained + 4)),
										`retained pixels ${captured}`,
									).toEqual([0, 0, 255, 255]);
								}

								const right = (10 * 100 + 70) * 4;
								expect(
									Array.from(pixels.slice(right, right + 4)),
									`resized frame ${captured}`,
								).toEqual(
									captured >= mountAt && (captured === 1 || captured === 51)
										? backend === 'incremental'
											? [0, 0, 255, 255]
											: color
										: [255, 255, 255, 255],
								);
								captured++;
								return frame;
							},
						});
						expect(captured).toBe(mountAt + 6);
					},
				);
			}
		}
	}

	for (const offset of [false, true]) {
		test(
			`captures custom blur in stills and every video frame (#${offset ? 12053 : 9917}, native=${allowHtmlInCanvas})`,
			{timeout: 60_000},
			async (t) => {
				if (!supportsNativeHtmlInCanvas()) {
					t.skip();
					return;
				}

				const {width, height} = htmlInCanvasBlur;
				const container = document.createElement('div');
				document.body.appendChild(container);
				const root = createRoot(container);
				let painted: Uint8ClampedArray | null = null;
				const onPainted = (canvas: OffscreenCanvas) => {
					painted = readPixels(canvas, width, height);
				};

				let preview: Uint8ClampedArray;
				try {
					root.render(
						<Player
							acknowledgeRemotionLicense
							component={htmlInCanvasBlur.component}
							compositionWidth={width}
							compositionHeight={height}
							fps={30}
							durationInFrames={60}
							inputProps={{filter: 'blur(8px)', offset, onPainted}}
							style={{width, height}}
						/>,
					);
					await vi.waitFor(() => {
						expect(painted).not.toBeNull();
						expect(
							painted!.filter((value, i) => i % 4 === 0 && value < 250).length,
						).toBeGreaterThan(1000);
						const canvas = container.querySelector('canvas');
						expect(canvas).not.toBeNull();
						expect(
							countDifferentPixels(
								readPixels(canvas!, width, height),
								painted!,
							),
						).toBe(0);
					});
					preview = readPixels(
						container.querySelector('canvas')!,
						width,
						height,
					);
				} finally {
					root.unmount();
					container.remove();
				}

				const options = {
					composition: htmlInCanvasBlur,
					inputProps: {filter: 'blur(8px)', offset, onPainted: null},
					allowHtmlInCanvas,
					licenseKey: 'free-license',
					isProduction: false,
					logLevel: 'error',
					delayRenderTimeoutInMilliseconds: 10_000,
				} as const;
				const unblurred = await renderStillOnWeb({
					...options,
					inputProps: {...options.inputProps, filter: 'none'},
					frame: 0,
				});
				expect(
					countDifferentPixels(
						readPixels(await unblurred.canvas(), width, height),
						preview,
					),
				).toBeGreaterThan(1000);
				// The original still failure was intermittent; each capture mounts anew.
				for (let attempt = 0; attempt < 6; attempt++) {
					const still = await renderStillOnWeb({...options, frame: 0});
					expect(
						countDifferentPixels(
							readPixels(await still.canvas(), width, height),
							preview,
						),
						`still ${attempt}`,
					).toBe(0);
				}

				let frameCount = 0;
				await renderMediaOnWeb({
					...options,
					frameRange: [0, 2],
					container: 'webm',
					videoCodec: 'vp9',
					hardwareAcceleration: 'prefer-software',
					muted: true,
					onFrame: (frame) => {
						expect(
							countDifferentPixels(readPixels(frame, width, height), preview),
							`video frame ${frameCount}`,
						).toBe(0);
						frameCount++;
						return frame;
					},
				});
				expect(frameCount).toBe(3);
			},
		);
	}
}

test('uses the DOM composer by default', async () => {
	const contextPrototype =
		CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & {
			drawElementImage?: () => void;
		};
	const originalDrawElementImage = Object.getOwnPropertyDescriptor(
		contextPrototype,
		'drawElementImage',
	);
	const originalRequestPaint = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'requestPaint',
	);
	Object.defineProperty(contextPrototype, 'drawElementImage', {
		configurable: true,
		value: () => undefined,
	});
	Object.defineProperty(HTMLCanvasElement.prototype, 'requestPaint', {
		configurable: true,
		value(this: HTMLCanvasElement) {
			this.dispatchEvent(new Event('paint'));
		},
	});
	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const result = await renderStillOnWeb({
			composition: backgroundColor,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		const canvas = await result.canvas();
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Could not get canvas context');
		}

		expect(Array.from(context.getImageData(100, 100, 1, 1).data)).toEqual([
			255, 0, 0, 255,
		]);
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
		if (originalDrawElementImage) {
			Object.defineProperty(
				contextPrototype,
				'drawElementImage',
				originalDrawElementImage,
			);
		} else {
			Reflect.deleteProperty(contextPrototype, 'drawElementImage');
		}

		if (originalRequestPaint) {
			Object.defineProperty(
				HTMLCanvasElement.prototype,
				'requestPaint',
				originalRequestPaint,
			);
		} else {
			Reflect.deleteProperty(HTMLCanvasElement.prototype, 'requestPaint');
		}
	}
});

test('uses native HTML-in-canvas only when explicitly enabled', async () => {
	if (!supportsNativeHtmlInCanvas()) {
		return;
	}

	const warn = vi
		.spyOn(Internals.Log, 'warn')
		.mockImplementation(() => undefined);

	try {
		const result = await renderStillOnWeb({
			allowHtmlInCanvas: true,
			composition: backgroundColor,
			frame: 0,
			inputProps: {},
			licenseKey: 'free-license',
		});
		await result.canvas();

		expect(
			warn.mock.calls.some((call) =>
				call.some(
					(value) =>
						typeof value === 'string' &&
						value.includes('Using Chromium experimental HTML-in-canvas'),
				),
			),
		).toBe(true);
	} finally {
		warn.mockRestore();
	}
});

test('does not create a nested HTML-in-canvas capture before Chrome 157', async () => {
	const userAgent = vi
		.spyOn(navigator, 'userAgent', 'get')
		.mockReturnValue('Chrome/156.0.0.0');
	const element = document.createElement('div');
	const nestedLayoutCanvas = document.createElement(
		'canvas',
	) as HTMLCanvasElement & {
		layoutSubtree?: boolean;
	};
	nestedLayoutCanvas.layoutSubtree = true;
	element.appendChild(nestedLayoutCanvas);
	document.body.appendChild(element);

	const outerLayoutCanvas = document.createElement('canvas');
	const context = outerLayoutCanvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get canvas context');
	}

	const drawElementImage = vi.fn();
	Object.assign(context, {drawElementImage});
	let outcome: HtmlInCanvasLayerOutcome | null = null;
	const internalState = makeInternalState({
		signal: null,
		maskImageTimeoutInMilliseconds: 30_000,
	});

	try {
		await createLayer({
			cutout: new DOMRect(0, 0, 10, 10),
			element,
			htmlInCanvasContext: {
				ctx: context as CanvasRenderingContext2D & {
					drawElementImage: typeof drawElementImage;
				},
				layoutCanvas: outerLayoutCanvas,
				wasDrawable: false,
			},
			internalState,
			logLevel: 'error',
			onHtmlInCanvasLayerOutcome: (newOutcome) => {
				outcome = newOutcome;
			},
			onlyBackgroundClipText: false,
			scale: 1,
			waitForPageResponsiveness: null,
		});

		expect(drawElementImage).not.toHaveBeenCalled();
		expect(outcome).toEqual({
			native: false,
			reason:
				'The composition contains an <HtmlInCanvas> element. Nested HTML-in-canvas capture requires Chrome 157 or newer, so the built-in DOM composer is used.',
			shouldWarn: false,
		});
	} finally {
		userAgent.mockRestore();
		internalState[Symbol.dispose]();
		element.remove();
	}
});

test('keeps a scaffold without HTML-in-canvas hidden', () => {
	const scaffold = createScaffold({
		sampleRate: null,
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
		sampleRate: null,
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
