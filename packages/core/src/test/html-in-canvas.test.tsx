import {afterEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React, {useCallback, useMemo} from 'react';
import type {TSequence} from '../CompositionManager.js';
import type {HtmlInCanvasOnPaintParams} from '../HtmlInCanvas.js';
import {HtmlInCanvas} from '../HtmlInCanvas.js';
import {Internals} from '../internals.js';
import type {SequenceManagerContext} from '../SequenceManager.js';
import {
	SequenceManager,
	VisualModeDragOverridesContext,
	VisualModePropStatusesContext,
	VisualModeSettersContext,
} from '../SequenceManager.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

class TestDOMMatrix {
	private readonly scaleX: number;
	private readonly scaleY: number;

	public constructor(scaleX = 1, scaleY = 1) {
		this.scaleX = scaleX;
		this.scaleY = scaleY;
	}

	public scale(x: number, y: number) {
		return new TestDOMMatrix(this.scaleX * x, this.scaleY * y);
	}

	public multiply(other: TestDOMMatrix) {
		return new TestDOMMatrix(
			this.scaleX * other.scaleX,
			this.scaleY * other.scaleY,
		);
	}

	public toString() {
		return `matrix(${this.scaleX}, 0, 0, ${this.scaleY}, 0, 0)`;
	}
}

Object.defineProperty(globalThis, 'DOMMatrix', {
	configurable: true,
	value: TestDOMMatrix,
});

const stub2dContext = () => {
	let currentTransform = new DOMMatrix();

	return {
		canvas: null as unknown as HTMLCanvasElement,
		reset: () => {
			currentTransform = new DOMMatrix();
		},
		scale: (x: number, y: number) => {
			currentTransform = currentTransform.scale(x, y);
		},
		drawElementImage: () => currentTransform,
		getImageData: () => ({
			data: new Uint8ClampedArray(4),
			width: 1,
			height: 1,
		}),
		putImageData: () => undefined,
	};
};

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
});

const SequenceTestWrapper: React.FC<{
	readonly children: React.ReactNode;
	readonly onRegisterSequence: (sequence: TSequence) => void;
	readonly isRendering?: boolean;
}> = ({children, onRegisterSequence, isRendering = false}) => {
	const registerSequence = useCallback(
		(sequence: TSequence) => {
			onRegisterSequence(sequence);
		},
		[onRegisterSequence],
	);

	const unregisterSequence = useCallback(() => undefined, []);

	const sequenceManagerContext: SequenceManagerContext = useMemo(() => {
		return {
			registerSequence,
			sequences: [],
			unregisterSequence,
		};
	}, [registerSequence, unregisterSequence]);

	const visualPropStatuses = useMemo(
		() => ({
			propStatuses: {},
		}),
		[],
	);

	const visualDragOverrides = useMemo(
		() => ({
			getDragOverrides: () => {
				throw new Error('VisualModeDragOverridesContext not initialized');
			},
			getEffectDragOverrides: () => {
				throw new Error('VisualModeDragOverridesContext not initialized');
			},
		}),
		[],
	);

	const visualSetters = useMemo(
		() => ({
			clearDragOverrides: () => undefined,
			clearEffectDragOverrides: () => undefined,
			setPropStatuses: () => undefined,
			setDragOverrides: () => undefined,
			setEffectDragOverrides: () => undefined,
		}),
		[],
	);

	return (
		<WrapSequenceContext>
			<Internals.RemotionEnvironmentContext
				value={{
					isClientSideRendering: false,
					isPlayer: false,
					isReadOnlyStudio: false,
					isRendering,
					isStudio: true,
				}}
			>
				<SequenceManager.Provider value={sequenceManagerContext}>
					<VisualModePropStatusesContext.Provider value={visualPropStatuses}>
						<VisualModeDragOverridesContext.Provider
							value={visualDragOverrides}
						>
							<VisualModeSettersContext.Provider value={visualSetters}>
								{children}
							</VisualModeSettersContext.Provider>
						</VisualModeDragOverridesContext.Provider>
					</VisualModePropStatusesContext.Provider>
				</SequenceManager.Provider>
			</Internals.RemotionEnvironmentContext>
		</WrapSequenceContext>
	);
};

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
	expect(registeredSequences[0]?.refForOutline?.current).toBe(canvas);
});

test('<HtmlInCanvas> keeps refs current when the canvas remounts', async () => {
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
		expect(canvasRef.current).not.toBe(firstCanvas);
	});

	const nextCanvas = container.querySelector('canvas');
	expect(nextCanvas).not.toBeNull();
	expect(canvasRef.current).toBe(nextCanvas);
	expect(registeredSequences[0]?.refForOutline?.current).toBe(nextCanvas);
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
		expect(container.querySelector('canvas')?.getAttribute('width')).toBe(
			'100',
		);
	});

	const canvas = container.querySelector('canvas')!;
	expect(canvas.getAttribute('height')).toBe('100');
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
});

test('<HtmlInCanvas> does not apply pixel density to the live DOM transform', async () => {
	const {container} = render(
		<SequenceTestWrapper onRegisterSequence={() => undefined}>
			<HtmlInCanvas width={50} height={50} pixelDensity={2}>
				<div>Test</div>
			</HtmlInCanvas>
		</SequenceTestWrapper>,
	);

	await waitFor(() => {
		expect(container.querySelector('canvas')?.getAttribute('width')).toBe(
			'100',
		);
	});

	const canvas = container.querySelector('canvas')!;
	canvas.dispatchEvent(new Event('paint'));

	const htmlInCanvasElement = canvas.querySelector('div');
	await waitFor(() => {
		expect(htmlInCanvasElement?.style.transform).toBe(
			new DOMMatrix().toString(),
		);
	});
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
