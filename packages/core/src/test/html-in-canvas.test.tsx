import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React, {useMemo} from 'react';
import type {TSequence} from '../CompositionManager.js';
import type {DelayRenderScope} from '../delay-render.js';
import type {HtmlInCanvasOnPaintParams} from '../HtmlInCanvas.js';
import {HtmlInCanvas, htmlInCanvasSchema} from '../HtmlInCanvas.js';
import {Internals} from '../internals.js';
import {
	SequenceManagerProvider,
	VisualModePropStatusesContext,
	VisualModeSettersContext,
} from '../SequenceManager.js';
import {useDelayRender} from '../use-delay-render.js';
import {
	ObserveSequenceRegistrations,
	WrapSequenceContext,
} from './wrap-sequence-context.js';

const stub2dContext = () => {
	return {
		canvas: null as unknown as HTMLCanvasElement,
		reset: () => undefined,
		scale: () => undefined,
		drawElementImage: () => undefined,
		drawImage: () => undefined,
		getImageData: () => ({
			data: new Uint8ClampedArray(4),
			width: 1,
			height: 1,
		}),
		putImageData: () => undefined,
	};
};

let transferControlToOffscreenCalls = 0;
const transferredCanvases = new WeakSet<HTMLCanvasElement>();

Object.defineProperties(HTMLCanvasElement.prototype, {
	getContext: {
		configurable: true,
		value(this: HTMLCanvasElement, kind: string) {
			if (kind === '2d') {
				const ctx = stub2dContext();
				ctx.canvas = this;
				return ctx;
			}

			return null;
		},
	},
	requestPaint: {
		configurable: true,
		value: () => undefined,
	},
	captureElementImage: {
		configurable: true,
		value: () => ({
			close: () => undefined,
			height: 1,
			width: 1,
		}),
	},
	transferControlToOffscreen: {
		configurable: true,
		value(this: HTMLCanvasElement) {
			// Real browsers only allow one transfer per canvas.
			if (transferredCanvases.has(this)) {
				throw new DOMException(
					'Cannot transfer control from a canvas for more than one time.',
					'InvalidStateError',
				);
			}

			transferredCanvases.add(this);
			transferControlToOffscreenCalls++;
			let contextMode: string | null = null;
			const webgl2Context = {
				drawingBufferHeight: this.height,
				drawingBufferWidth: this.width,
			};

			return {
				getContext: (kind: string) => {
					if (contextMode && contextMode !== kind) {
						return null;
					}

					if (kind === '2d') {
						contextMode = kind;
						const ctx = stub2dContext();
						ctx.canvas = this;
						return ctx;
					}

					if (kind === 'webgl2') {
						contextMode = kind;
						return webgl2Context;
					}

					return null;
				},
				height: this.height,
				width: this.width,
			};
		},
	},
});

const resetDelayRenderState = () => {
	const w = window as unknown as {
		remotion_cancelledError?: string;
		remotion_delayRenderHandles: number[];
		remotion_delayRenderTimeouts: Record<
			string,
			{timeout: ReturnType<typeof setTimeout>}
		>;
		remotion_renderReady: boolean;
	};

	for (const {timeout} of Object.values(w.remotion_delayRenderTimeouts ?? {})) {
		clearTimeout(timeout);
	}

	w.remotion_cancelledError = undefined;
	w.remotion_delayRenderHandles = [];
	w.remotion_delayRenderTimeouts = {};
	w.remotion_renderReady = false;
};

afterEach(() => {
	cleanup();
	resetDelayRenderState();
	transferControlToOffscreenCalls = 0;
});

const SequenceTestWrapper: React.FC<{
	readonly children: React.ReactNode;
	readonly onRegisterSequence: (sequence: TSequence) => void;
	readonly isRendering?: boolean;
	readonly isClientSideRendering?: boolean;
	readonly compositionDurationInFrames?: number;
	readonly currentFrame?: number;
}> = ({
	children,
	onRegisterSequence,
	isRendering = false,
	isClientSideRendering = false,
	compositionDurationInFrames,
	currentFrame,
}) => {
	const visualPropStatuses = useMemo(
		() => ({
			propStatuses: {},
		}),
		[],
	);

	const visualSetters = useMemo(
		() => ({
			clearDragOverrides: () => undefined,
			clearEffectDragOverrides: () => undefined,
			remapPropStatuses: () => undefined,
			setPropStatuses: () => undefined,
			setPropStatusesBatch: () => undefined,
			setDragOverrides: () => undefined,
			updateDragOverrides: () => undefined,
			updateDragOverridesBatch: () => undefined,
			remapDragOverrideFields: () => undefined,
			updateEffectDragOverridesBatch: () => undefined,
			remapEffectDragOverrideFields: () => undefined,
			setEffectDragOverrides: () => undefined,
		}),
		[],
	);

	return (
		<WrapSequenceContext
			compositionDurationInFrames={compositionDurationInFrames}
			currentFrame={currentFrame}
		>
			<Internals.RemotionEnvironmentContext
				value={{
					isClientSideRendering,
					isPlayer: false,
					isReadOnlyStudio: false,
					isRendering,
					isStudio: true,
				}}
			>
				<SequenceManagerProvider>
					<ObserveSequenceRegistrations
						onRegisterSequence={onRegisterSequence}
					/>
					<VisualModePropStatusesContext.Provider value={visualPropStatuses}>
						<VisualModeSettersContext.Provider value={visualSetters}>
							{children}
						</VisualModeSettersContext.Provider>
					</VisualModePropStatusesContext.Provider>
				</SequenceManagerProvider>
			</Internals.RemotionEnvironmentContext>
		</WrapSequenceContext>
	);
};

test('<HtmlInCanvas> remains visible with a negative offset', () => {
	const {queryByText} = render(
		<SequenceTestWrapper
			compositionDurationInFrames={100}
			currentFrame={75}
			onRegisterSequence={() => undefined}
		>
			<HtmlInCanvas from={-100} width={120} height={80}>
				<div>Still visible</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	expect(queryByText('Still visible')).not.toBeNull();
});

test('<HtmlInCanvas> registers its canvas for outline selection', async () => {
	const registeredSequences: TSequence[] = [];
	const canvasRef = React.createRef<HTMLCanvasElement>();

	const {container} = render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<HtmlInCanvas ref={canvasRef} width={120} height={80}>
				<div>Test</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(registeredSequences.length).toBe(1);
	});

	const canvas = container.querySelector('canvas');
	expect(canvas).not.toBeNull();
	expect(canvasRef.current).toBe(canvas);
	expect(
		Internals.SequenceOutlineInternals.getNodes(
			registeredSequences[0].refForOutline!,
		),
	).toEqual([]);
});

test('<HtmlInCanvas> renders internal capture siblings directly in the canvas', () => {
	const {container} = render(
		<SequenceTestWrapper onRegisterSequence={() => undefined}>
			<HtmlInCanvas
				width={120}
				height={80}
				_remotionInternalCanvasSiblings={
					<div data-testid="second-sample">Second sample</div>
				}
			>
				<div data-testid="first-sample">First sample</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	const canvas = container.querySelector('canvas');
	expect(canvas).not.toBeNull();
	expect(canvas?.children.length).toBe(2);
	expect(
		canvas?.children[0]?.querySelector('[data-testid="first-sample"]'),
	).not.toBeNull();
	expect(canvas?.children[1]?.getAttribute('data-testid')).toBe(
		'second-sample',
	);
});

test('<HtmlInCanvas> applies crop props to its canvas', () => {
	const {container} = render(
		<SequenceTestWrapper onRegisterSequence={() => undefined}>
			<HtmlInCanvas
				width={120}
				height={80}
				cropLeft={0.1}
				cropRight={0.2}
				cropTop={0.3}
				cropBottom={0.4}
			>
				<div>Test</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	expect(container.querySelector('canvas')?.style.clipPath).toBe(
		'inset(30% 20% 40% 10%)',
	);
});

test('<HtmlInCanvas> exposes crop controls', () => {
	expect(htmlInCanvasSchema.cropLeft.keyframable).toBe(true);
	expect(htmlInCanvasSchema.cropRight.keyframable).toBe(true);
	expect(htmlInCanvasSchema.cropTop.keyframable).toBe(true);
	expect(htmlInCanvasSchema.cropBottom.keyframable).toBe(true);
});

test('<HtmlInCanvas> throws when nested during rendering', () => {
	expect(() =>
		render(
			<SequenceTestWrapper isRendering onRegisterSequence={() => undefined}>
				<HtmlInCanvas width={120} height={80}>
					<HtmlInCanvas width={60} height={40}>
						<div>Nested</div>
					</HtmlInCanvas>
				</HtmlInCanvas>
			</SequenceTestWrapper>,
		),
	).toThrow('Nested <HtmlInCanvas> components require Chrome 157 or newer');
});

test('<HtmlInCanvas> clarifies that nested HTML-in-canvas is unavailable in preview fallback', () => {
	const {getByText} = render(
		<SequenceTestWrapper onRegisterSequence={() => undefined}>
			<HtmlInCanvas width={120} height={80}>
				<HtmlInCanvas width={60} height={40}>
					<div>Nested</div>
				</HtmlInCanvas>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	expect(getByText('Nested HTML-in-canvas is unavailable')).toBeTruthy();
});

test('<HtmlInCanvas> preserves the canvas and its children when resizing', async () => {
	const registeredSequences: TSequence[] = [];
	const canvasRef = React.createRef<HTMLCanvasElement>();

	const {container, rerender} = render(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<HtmlInCanvas ref={canvasRef} width={120} height={80}>
				<div>Test</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(registeredSequences.length).toBe(1);
	});

	const firstCanvas = container.querySelector('canvas');
	expect(firstCanvas).not.toBeNull();
	const firstChild = firstCanvas!.querySelector('div > div');
	expect(firstChild).not.toBeNull();

	rerender(
		<SequenceTestWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<HtmlInCanvas ref={canvasRef} width={121} height={80}>
				<div>Test</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(canvasRef.current).toBe(firstCanvas);
		expect(canvasRef.current?.width).toBe(121);
	});

	const nextCanvas = container.querySelector('canvas');
	expect(nextCanvas).not.toBeNull();
	expect(canvasRef.current).toBe(nextCanvas);
	expect(nextCanvas!.querySelector('div > div')).toBe(firstChild);
	expect(
		Internals.SequenceOutlineInternals.getNodes(
			registeredSequences[0].refForOutline!,
		),
	).toEqual([]);
});

test('<HtmlInCanvas> can use a higher backing density', async () => {
	let paintParams: HtmlInCanvasOnPaintParams | undefined;

	const {container} = render(
		<SequenceTestWrapper onRegisterSequence={() => undefined}>
			<HtmlInCanvas
				width={50}
				height={50}
				pixelDensity={2}
				onPaint={(params) => {
					paintParams = params;
				}}
			>
				<div>Test</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(container.querySelector('canvas')).not.toBeNull();
	});

	const canvas = container.querySelector('canvas')!;
	expect(canvas.style.width).toBe('50px');
	expect(canvas.style.height).toBe('50px');

	canvas.dispatchEvent(new Event('paint'));

	await waitFor(() => {
		expect(paintParams).not.toBeUndefined();
	});

	if (!paintParams) {
		throw new Error('Expected paint params to be captured');
	}

	expect(paintParams.canvas.width).toBe(100);
	expect(paintParams.canvas.height).toBe(100);
	expect(paintParams.pixelDensity).toBe(2);
	expect(transferControlToOffscreenCalls).toBe(1);
});

test('<HtmlInCanvas> tolerates layout effect re-runs on the same canvas', async () => {
	// StrictMode double-invokes effects on the same canvas element. A second
	// transferControlToOffscreen() call throws an InvalidStateError in real
	// browsers, so the transferred OffscreenCanvas must be reused.
	const {container} = render(
		<React.StrictMode>
			<SequenceTestWrapper onRegisterSequence={() => undefined}>
				<HtmlInCanvas width={50} height={50} onPaint={() => undefined}>
					<div>Test</div>
				</HtmlInCanvas>
			</SequenceTestWrapper>
		</React.StrictMode>,
	);

	await waitFor(() => {
		expect(container.querySelector('canvas')).not.toBeNull();
	});

	expect(transferControlToOffscreenCalls).toBe(1);
});

test('<HtmlInCanvas> lets onInit choose a WebGL2 context', async () => {
	let gotWebGl2Context = false;
	let paintCalled = false;

	const {container} = render(
		<SequenceTestWrapper onRegisterSequence={() => undefined}>
			<HtmlInCanvas
				width={50}
				height={50}
				onInit={({canvas: offscreenCanvas}) => {
					gotWebGl2Context = Boolean(offscreenCanvas.getContext('webgl2'));
					return () => undefined;
				}}
				onPaint={() => {
					paintCalled = true;
				}}
			>
				<div>Test</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(container.querySelector('canvas')).not.toBeNull();
	});

	const canvas = container.querySelector('canvas')!;
	canvas.dispatchEvent(new Event('paint'));

	await waitFor(() => {
		expect(gotWebGl2Context).toBe(true);
		expect(paintCalled).toBe(true);
	});
});

test('<HtmlInCanvas> keeps the visible ref when switching paint handlers and resizing', async () => {
	const canvasRef = React.createRef<HTMLCanvasElement>();
	let initCalls = 0;
	let cleanupCalls = 0;
	let initializedSize: number | null = null;
	let delayNextInitialization = false;
	let resolveInitialization: (() => void) | null = null;
	const paintedSizes: number[] = [];
	const Component: React.FC<{
		readonly customPaint: boolean;
		readonly size: number;
		readonly density: number;
	}> = ({customPaint, size, density}) => (
		<React.StrictMode>
			<SequenceTestWrapper isRendering onRegisterSequence={() => undefined}>
				<HtmlInCanvas
					ref={canvasRef}
					width={size}
					height={size}
					pixelDensity={density}
					onInit={
						customPaint
							? async ({canvas}) => {
									initCalls++;
									const initialWidth = canvas.width;
									if (delayNextInitialization) {
										delayNextInitialization = false;
										await new Promise<void>((resolve) => {
											resolveInitialization = resolve;
										});
									}

									initializedSize = initialWidth;
									return () => {
										cleanupCalls++;
										initializedSize = null;
									};
								}
							: undefined
					}
					onPaint={
						customPaint
							? ({canvas}) => {
									expect(initializedSize).toBe(canvas.width);
									paintedSizes.push(canvas.width);
								}
							: undefined
					}
				>
					<div>Test</div>
				</HtmlInCanvas>
			</SequenceTestWrapper>
		</React.StrictMode>
	);
	const {container, rerender} = render(
		<Component customPaint={false} size={50} density={2} />,
	);
	const preview = canvasRef.current;
	expect(container.querySelectorAll('canvas')).toHaveLength(1);
	expect(transferControlToOffscreenCalls).toBe(0);

	rerender(<Component customPaint size={50} density={2} />);
	const output = canvasRef.current;
	expect(output).not.toBe(preview);
	expect(container.querySelectorAll('canvas')).toHaveLength(2);
	expect(output).toBe(container.querySelectorAll('canvas')[1]);
	expect(transferControlToOffscreenCalls).toBe(1);
	container.querySelector('canvas')!.dispatchEvent(new Event('paint'));
	await waitFor(() => expect(paintedSizes).toEqual([100]));

	rerender(<Component customPaint size={60} density={2} />);
	expect(canvasRef.current).toBe(output);
	expect(canvasRef.current?.getAttribute('width')).toBe('120');
	expect(canvasRef.current?.style.width).toBe('60px');
	expect(transferControlToOffscreenCalls).toBe(1);
	container.querySelector('canvas')!.dispatchEvent(new Event('paint'));
	await waitFor(() => expect(paintedSizes).toEqual([100, 120]));
	expect(initCalls).toBe(2);
	expect(cleanupCalls).toBe(1);

	delayNextInitialization = true;
	rerender(<Component customPaint size={60} density={3} />);
	container.querySelector('canvas')!.dispatchEvent(new Event('paint'));
	expect(initCalls).toBe(3);
	rerender(<Component customPaint size={70} density={3} />);
	container.querySelector('canvas')!.dispatchEvent(new Event('paint'));
	expect(initCalls).toBe(3);
	resolveInitialization!();
	await waitFor(() => expect(cleanupCalls).toBe(3));
	container.querySelector('canvas')!.dispatchEvent(new Event('paint'));
	await waitFor(() => expect(paintedSizes).toEqual([100, 120, 210]));
	expect(initCalls).toBe(4);
	expect(canvasRef.current).toBe(output);
	expect(transferControlToOffscreenCalls).toBe(1);

	rerender(<Component customPaint={false} size={70} density={3} />);
	expect(container.querySelectorAll('canvas')).toHaveLength(1);
	expect(canvasRef.current).toBe(container.querySelector('canvas'));
	expect(transferControlToOffscreenCalls).toBe(1);
	expect(cleanupCalls).toBe(4);
});

test('<HtmlInCanvas> copies custom paint before releasing scoped delayRender handles', async () => {
	const delayRenderScope: DelayRenderScope = {
		remotion_attempt: 0,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 30_000,
		remotion_renderReady: true,
	};
	const canvasRef = React.createRef<HTMLCanvasElement>();
	let paintedCanvas: OffscreenCanvas | null = null;
	const copied: CanvasImageSource[] = [];
	let resolvePaint!: () => void;
	const paintPromise = new Promise<void>((resolve) => {
		resolvePaint = resolve;
	});

	const {container} = render(
		<Internals.DelayRenderContextType.Provider value={delayRenderScope}>
			<SequenceTestWrapper
				isClientSideRendering
				isRendering
				onRegisterSequence={() => undefined}
			>
				<HtmlInCanvas
					ref={canvasRef}
					width={50}
					height={50}
					onPaint={({canvas: offscreenCanvas}) => {
						paintedCanvas = offscreenCanvas;
						return paintPromise;
					}}
				>
					<div>Test</div>
				</HtmlInCanvas>
			</SequenceTestWrapper>
		</Internals.DelayRenderContextType.Provider>,
	);

	await waitFor(() => {
		expect(delayRenderScope.remotion_delayRenderHandles).toHaveLength(1);
	});
	expect(window.remotion_delayRenderHandles).toHaveLength(0);

	const canvas = container.querySelector('canvas')!;
	expect(canvasRef.current).not.toBe(canvas);
	expect(canvasRef.current).toBe(container.querySelectorAll('canvas')[1]);
	Object.defineProperty(canvasRef.current, 'getContext', {
		value: () => ({
			...stub2dContext(),
			drawImage: (source: CanvasImageSource) => {
				expect(delayRenderScope.remotion_renderReady).toBe(false);
				copied.push(source);
			},
		}),
	});
	canvas.dispatchEvent(new Event('paint'));

	await waitFor(() => {
		expect(delayRenderScope.remotion_delayRenderHandles).toHaveLength(1);
		expect(delayRenderScope.remotion_renderReady).toBe(false);
	});
	expect(window.remotion_delayRenderHandles).toHaveLength(0);

	expect(copied).toHaveLength(0);
	resolvePaint();
	await waitFor(() => {
		expect(delayRenderScope.remotion_delayRenderHandles).toHaveLength(0);
		expect(delayRenderScope.remotion_renderReady).toBe(true);
		expect(copied).toHaveLength(1);
		expect(copied[0]).toBe(paintedCanvas!);
	});
});

test('<HtmlInCanvas> skips paint when element is outside viewport', async () => {
	const originalDescriptor = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'captureElementImage',
	);

	const w = window as unknown as {remotion_cancelledError?: string};
	w.remotion_cancelledError = undefined;

	Object.defineProperty(HTMLCanvasElement.prototype, 'captureElementImage', {
		configurable: true,
		value: () => {
			throw new DOMException(
				'No cached paint record for element',
				'InvalidStateError',
			);
		},
	});

	let paintCalled = false;

	try {
		const {container} = render(
			<SequenceTestWrapper onRegisterSequence={() => undefined}>
				<HtmlInCanvas
					width={50}
					height={50}
					onPaint={() => {
						paintCalled = true;
					}}
				>
					<div>Test</div>
				</HtmlInCanvas>
			</SequenceTestWrapper>,
		);

		await waitFor(() => {
			expect(container.querySelector('canvas')).not.toBeNull();
		});

		const canvas = container.querySelector('canvas')!;
		canvas.dispatchEvent(new Event('paint'));

		expect(paintCalled).toBe(false);
		expect(w.remotion_cancelledError).toBeUndefined();
	} finally {
		if (originalDescriptor) {
			Object.defineProperty(
				HTMLCanvasElement.prototype,
				'captureElementImage',
				originalDescriptor,
			);
		}

		w.remotion_cancelledError = undefined;
	}
});

test('<HtmlInCanvas> asserts during rendering when element is outside viewport', async () => {
	const originalDescriptor = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'captureElementImage',
	);

	const w = window as unknown as {remotion_cancelledError?: string};
	w.remotion_cancelledError = undefined;

	const onExpectedError = (event: ErrorEvent) => {
		event.preventDefault();
	};

	window.addEventListener('error', onExpectedError);

	Object.defineProperty(HTMLCanvasElement.prototype, 'captureElementImage', {
		configurable: true,
		value: () => {
			throw new DOMException(
				'No cached paint record for element',
				'InvalidStateError',
			);
		},
	});

	let paintCalled = false;

	try {
		const {container} = render(
			<SequenceTestWrapper isRendering onRegisterSequence={() => undefined}>
				<HtmlInCanvas
					width={50}
					height={50}
					onPaint={() => {
						paintCalled = true;
					}}
				>
					<div>Test</div>
				</HtmlInCanvas>
			</SequenceTestWrapper>,
		);

		await waitFor(() => {
			expect(container.querySelector('canvas')).not.toBeNull();
		});

		const canvas = container.querySelector('canvas')!;
		canvas.dispatchEvent(new Event('paint'));

		expect(paintCalled).toBe(false);
		expect(w.remotion_cancelledError ?? '').toContain(
			'Expected the element to be inside the viewport during rendering',
		);
	} finally {
		if (originalDescriptor) {
			Object.defineProperty(
				HTMLCanvasElement.prototype,
				'captureElementImage',
				originalDescriptor,
			);
		}

		w.remotion_cancelledError = undefined;
		window.removeEventListener('error', onExpectedError);
	}
});

test('<HtmlInCanvas> retries a missing paint record during client-side rendering', async () => {
	const originalDescriptor = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'captureElementImage',
	);

	const w = window as unknown as {remotion_cancelledError?: string};
	w.remotion_cancelledError = undefined;

	const originalUserAgent = Object.getOwnPropertyDescriptor(
		navigator,
		'userAgent',
	);
	Object.defineProperty(navigator, 'userAgent', {
		configurable: true,
		value: 'Chrome/157.0.0.0',
	});

	let captureCalls = 0;
	Object.defineProperty(HTMLCanvasElement.prototype, 'captureElementImage', {
		configurable: true,
		value: () => {
			captureCalls++;
			if (captureCalls === 2) {
				throw new DOMException(
					'No cached paint record for element',
					'InvalidStateError',
				);
			}

			return {
				close: () => undefined,
				height: 1,
				width: 1,
			};
		},
	});

	let paintCalled = false;

	try {
		const {container} = render(
			<SequenceTestWrapper
				isClientSideRendering
				isRendering
				onRegisterSequence={() => undefined}
			>
				<HtmlInCanvas
					width={50}
					height={50}
					onPaint={() => {
						paintCalled = true;
					}}
				>
					<HtmlInCanvas width={25} height={25}>
						<div>Test</div>
					</HtmlInCanvas>
				</HtmlInCanvas>
			</SequenceTestWrapper>,
		);

		await waitFor(() => {
			expect(container.querySelector('canvas')).not.toBeNull();
		});

		const canvas = container.querySelector('canvas')!;
		canvas.querySelector('canvas')!.dispatchEvent(new Event('paint'));
		await new Promise((resolve) => setTimeout(resolve, 0));
		canvas.dispatchEvent(new Event('paint'));

		expect(paintCalled).toBe(false);
		// Skipping an unavailable record must also release the nested paint barrier.
		expect(window.remotion_renderReady).toBe(true);
		expect(w.remotion_cancelledError).toBeUndefined();

		canvas.dispatchEvent(new Event('paint'));
		await waitFor(() => {
			expect(paintCalled).toBe(true);
		});
		expect(captureCalls).toBe(3);
		expect(w.remotion_cancelledError).toBeUndefined();
	} finally {
		if (originalUserAgent) {
			Object.defineProperty(navigator, 'userAgent', originalUserAgent);
		} else {
			Reflect.deleteProperty(navigator, 'userAgent');
		}

		if (originalDescriptor) {
			Object.defineProperty(
				HTMLCanvasElement.prototype,
				'captureElementImage',
				originalDescriptor,
			);
		}

		w.remotion_cancelledError = undefined;
	}
});

for (const behavior of [
	'owned',
	'resized',
	'replaced-paint',
	'replaced-init',
	'replaced-init-late-success',
	'replaced-init-late-reject',
	'unmounted',
	'unowned',
	'success',
] as const) {
	test(`<HtmlInCanvas> terminal paint reporting: ${behavior}`, async () => {
		const scope: DelayRenderScope = {
			remotion_renderReady: true,
			remotion_delayRenderHandles: [],
			remotion_delayRenderTimeouts: {},
			remotion_puppeteerTimeout: 30000,
			remotion_attempt: 1,
		};
		const failure = new Error('controlled HtmlInCanvas paint failure');
		const reported: Error[] = [];
		const paintListeners: EventListener[] = [];
		const previousAdd = Object.getOwnPropertyDescriptor(
			HTMLCanvasElement.prototype,
			'addEventListener',
		);
		const previousCapture = Object.getOwnPropertyDescriptor(
			HTMLCanvasElement.prototype,
			'captureElementImage',
		);
		const originalAdd = HTMLCanvasElement.prototype.addEventListener;
		let closes = 0;
		let rejectPaint: ((error: Error) => void) | null = null;
		let resolvePaint: (() => void) | null = null;
		const paint = new Promise<void>((resolve, reject) => {
			resolvePaint = resolve;
			rejectPaint = reject;
		});
		Object.defineProperty(HTMLCanvasElement.prototype, 'addEventListener', {
			configurable: true,
			value(
				this: HTMLCanvasElement,
				type: string,
				listener: EventListenerOrEventListenerObject,
				options?: boolean | AddEventListenerOptions,
			) {
				if (type === 'paint' && typeof listener === 'function')
					paintListeners.push(listener);
				return originalAdd.call(this, type, listener, options);
			},
		});
		Object.defineProperty(HTMLCanvasElement.prototype, 'captureElementImage', {
			configurable: true,
			value: () => ({
				width: 1,
				height: 1,
				close: () => {
					closes++;
				},
			}),
		});
		try {
			let siblingControls!: ReturnType<typeof useDelayRender>;
			const Sibling = () => {
				siblingControls = useDelayRender();
				return null;
			};

			const sibling = render(
				<Internals.DelayRenderContextType.Provider value={scope}>
					<Sibling />
				</Internals.DelayRenderContextType.Provider>,
			);
			const siblingHandle = siblingControls.delayRender('unrelated sibling');
			let owner = 0;
			let initializationCalls = 0;
			let replacementPaintCalls = 0;
			const resources = new Set<number>();
			const initializationCleanups: number[] = [];
			const initialization = behavior.startsWith('replaced-init');
			const lateInitialization = behavior.startsWith('replaced-init-late');
			let releaseReplacementPaint!: () => void;
			const replacementPaint = new Promise<void>((resolve) => {
				releaseReplacementPaint = resolve;
			});
			const originalOwner = (error: Error) => {
				if (owner === 0) reported.push(error);
			};

			const replacementOwner = (error: Error) => reported.push(error);
			const scene = (width: number) => (
				<Internals.DelayRenderContextType.Provider value={scope}>
					<Internals.CancelRenderContext.Provider
						value={
							behavior === 'unowned'
								? null
								: owner === 0
									? originalOwner
									: replacementOwner
						}
					>
						<SequenceTestWrapper onRegisterSequence={() => undefined}>
							<HtmlInCanvas
								width={width}
								height={50}
								onInit={
									initialization
										? async () => {
												const initializingOwner = owner;
												initializationCalls++;
												if (initializingOwner === 0) await paint;
												resources.add(initializingOwner);
												return () => {
													initializationCleanups.push(initializingOwner);
													resources.delete(initializingOwner);
												};
											}
										: undefined
								}
								onPaint={() => {
									if (initialization && owner === 1)
										expect(resources.has(1)).toBe(true);
									if (lateInitialization && owner === 1) {
										replacementPaintCalls++;
										return replacementPaint;
									}

									return owner === 0 ? paint : undefined;
								}}
							>
								<div>paint</div>
							</HtmlInCanvas>
						</SequenceTestWrapper>
					</Internals.CancelRenderContext.Provider>
				</Internals.DelayRenderContextType.Provider>
			);
			const view = render(scene(50));
			const canvas = view.container.querySelector('canvas')!;
			expect(paintListeners.length).toBeGreaterThanOrEqual(2);
			// Await the actual registered async paint callback; DOM dispatch does not expose its Promise.
			const pending = (
				paintListeners[0]!.call(
					canvas,
					new Event('paint'),
				) as unknown as Promise<void>
			).then(
				() => null,
				(error: unknown) => error,
			);
			for (const listener of paintListeners.slice(1))
				listener.call(canvas, new Event('paint'));
			if (behavior === 'unmounted') view.unmount();
			if (behavior === 'resized') view.rerender(scene(51));
			const replaced = behavior === 'replaced-paint' || initialization;
			if (replaced) {
				expect(scope.remotion_delayRenderHandles.length).toBeGreaterThan(1);
				const transfers = transferControlToOffscreenCalls;
				const retiredHandles = scope.remotion_delayRenderHandles.filter(
					(handle) => handle !== siblingHandle,
				);
				owner = 1;
				view.rerender(scene(50));
				expect(view.container.querySelector('canvas')).toBe(canvas);
				expect(transferControlToOffscreenCalls).toBe(transfers);
				for (const handle of retiredHandles)
					expect(scope.remotion_delayRenderHandles).not.toContain(handle);
				expect(scope.remotion_delayRenderHandles).toContain(siblingHandle);
			}

			if (lateInitialization) {
				canvas.dispatchEvent(new Event('paint'));
				await waitFor(() => expect(initializationCalls).toBe(2));
				await waitFor(() => expect(replacementPaintCalls).toBe(1));
				expect(resources.has(1)).toBe(true);
			}

			const pendingHandles = scope.remotion_delayRenderHandles.length;
			if (behavior === 'success' || behavior === 'replaced-init-late-success')
				resolvePaint!();
			else rejectPaint!(failure);
			const rejection = await pending;
			expect(closes).toBe(lateInitialization ? 2 : 1);
			if (behavior === 'unowned') {
				expect(rejection).toBe(failure);
				expect(scope.remotion_cancelledErrorObject).toBe(failure);
				expect(scope.remotion_cancelledError).toContain(failure.message);
			} else {
				expect(rejection).toBeNull();
				expect(reported).toEqual(
					behavior === 'owned' || behavior === 'resized' ? [failure] : [],
				);
				expect(scope.remotion_cancelledError).toBeUndefined();
			}

			if (
				behavior === 'owned' ||
				behavior === 'resized' ||
				behavior === 'unowned'
			) {
				expect(scope.remotion_delayRenderHandles.length).toBe(pendingHandles);
				expect(scope.remotion_renderReady).toBe(false);
			}

			if (lateInitialization) {
				expect(resources.has(1)).toBe(true);
				expect(resources.has(0)).toBe(false);
				expect(initializationCleanups).toEqual(
					behavior === 'replaced-init-late-success' ? [0] : [],
				);
				expect(scope.remotion_delayRenderHandles.length).toBe(pendingHandles);
				canvas.dispatchEvent(new Event('paint'));
				expect(replacementPaintCalls).toBe(1);
				releaseReplacementPaint();
			}

			if (replaced) {
				// The replacement may allocate its own initial-paint hold. Complete
				// that healthy paint without releasing another component's hold.
				if (!lateInitialization) canvas.dispatchEvent(new Event('paint'));
				await waitFor(() =>
					expect(scope.remotion_delayRenderHandles).toEqual([siblingHandle]),
				);
			}

			if (behavior === 'success' || replaced)
				expect(scope.remotion_delayRenderHandles).toEqual([siblingHandle]);
			view.unmount();
			if (initialization) {
				expect(initializationCalls).toBe(2);
				expect(initializationCleanups).toEqual(
					behavior === 'replaced-init-late-success' ? [0, 1] : [1],
				);
			}

			expect(scope.remotion_delayRenderHandles).toEqual([siblingHandle]);
			expect(scope.remotion_renderReady).toBe(false);
			siblingControls.continueRender(siblingHandle);
			sibling.unmount();
			expect(scope.remotion_delayRenderHandles).toEqual([]);
			expect(scope.remotion_renderReady).toBe(behavior !== 'unowned');
		} finally {
			cleanup();
			if (previousAdd)
				Object.defineProperty(
					HTMLCanvasElement.prototype,
					'addEventListener',
					previousAdd,
				);
			else
				Reflect.deleteProperty(HTMLCanvasElement.prototype, 'addEventListener');
			if (previousCapture)
				Object.defineProperty(
					HTMLCanvasElement.prototype,
					'captureElementImage',
					previousCapture,
				);
			else
				Reflect.deleteProperty(
					HTMLCanvasElement.prototype,
					'captureElementImage',
				);
			for (const item of Object.values(scope.remotion_delayRenderTimeouts))
				clearTimeout(item.timeout);
		}
	});
}
