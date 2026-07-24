import {afterEach, beforeEach, expect, test} from 'bun:test';
import {act, cleanup, render, waitFor} from '@testing-library/react';
import React from 'react';
import {BufferingContextReact} from '../buffering.js';
import {canvasImageSchema} from '../canvas-image/CanvasImage.js';
import {CanvasImage} from '../canvas-image/index.js';
import type {TSequence} from '../CompositionManager.js';
import type {
	EffectApplyParams,
	EffectDefinition,
	EffectDescriptor,
} from '../effects/effect-types.js';
import {Internals} from '../internals.js';
import type {SequenceContextType} from '../SequenceContext.js';
import {SequenceContext} from '../SequenceContext.js';
import type {SequenceManagerContext} from '../SequenceManager.js';
import {SequenceManager} from '../SequenceManager.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

type DrawImageCall = {
	readonly canvas: HTMLCanvasElement;
	readonly args: unknown[];
};

const drawImageCalls: DrawImageCall[] = [];
let imageLoadCount = 0;

const stub2dContext = (canvas: HTMLCanvasElement) => ({
	canvas,
	fillStyle: '',
	fillRect: () => undefined,
	clearRect: () => undefined,
	drawImage: (...args: unknown[]) => {
		drawImageCalls.push({canvas, args});
	},
	reset: () => undefined,
	getImageData: () => ({
		data: new Uint8ClampedArray(4),
		width: 1,
		height: 1,
	}),
	putImageData: () => undefined,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
	configurable: true,
	value(this: HTMLCanvasElement, kind: string) {
		if (kind === '2d') {
			return stub2dContext(this);
		}

		return null;
	},
});

class MockImage {
	public onload: (() => void) | null = null;
	public onerror: (() => void) | null = null;
	public crossOrigin: string | null = null;
	public naturalWidth = 200;
	public naturalHeight = 100;
	public width = 200;
	public height = 100;
	public decode = () => Promise.resolve();
	private currentSrc = '';

	public get src() {
		return this.currentSrc;
	}

	public set src(src: string) {
		this.currentSrc = src;
		imageLoadCount++;
		queueMicrotask(() => this.onload?.());
	}
}

const OriginalImage = globalThis.Image;
const OriginalRequestAnimationFrame = globalThis.requestAnimationFrame;
const OriginalCancelAnimationFrame = globalThis.cancelAnimationFrame;

const getDelayRenderState = () =>
	window as unknown as {
		remotion_cancelledError?: string;
		remotion_delayRenderHandles: number[];
		remotion_delayRenderTimeouts: Record<
			string,
			{timeout: ReturnType<typeof setTimeout>}
		>;
		remotion_renderReady: boolean;
	};

const resetDelayRenderState = () => {
	const w = getDelayRenderState();
	for (const {timeout} of Object.values(w.remotion_delayRenderTimeouts ?? {})) {
		clearTimeout(timeout);
	}

	w.remotion_cancelledError = undefined;
	w.remotion_delayRenderHandles = [];
	w.remotion_delayRenderTimeouts = {};
	w.remotion_renderReady = false;
};

const studioEnv = {
	isRendering: false,
	isClientSideRendering: false,
	isPlayer: false,
	isStudio: true,
	isReadOnlyStudio: false,
};

const makeSequenceContext = (premounting: boolean): SequenceContextType => ({
	absoluteFrom: 0,
	cumulatedFrom: 0,
	cumulatedNegativeFrom: 0,
	durationInFrames: 100,
	height: 1080,
	id: 'parent',
	parentFrom: 0,
	postmountDisplay: null,
	postmounting: false,
	premountDisplay: null,
	premounting,
	relativeFrom: 0,
	width: 1080,
});

const BufferingEvents: React.FC<{
	readonly events: string[];
}> = ({events}) => {
	const manager = React.useContext(BufferingContextReact);

	React.useLayoutEffect(() => {
		if (!manager) {
			throw new Error('Expected BufferingContextReact');
		}

		const buffering = manager.listenForBuffering(() => {
			events.push('waiting');
		});
		const resume = manager.listenForResume(() => {
			events.push('resume');
		});

		return () => {
			buffering.remove();
			resume.remove();
		};
	}, [events, manager]);

	return null;
};

const wrapCanvasImage = (
	element: React.ReactElement,
	currentFrame: number = 0,
) => {
	return (
		<Internals.RemotionEnvironmentContext value={studioEnv}>
			<WrapSequenceContext currentFrame={currentFrame}>
				{element}
			</WrapSequenceContext>
		</Internals.RemotionEnvironmentContext>
	);
};

const canvasImageInSequence = ({
	events,
	premounting,
}: {
	readonly events?: string[];
	readonly premounting: boolean;
}) => (
	<SequenceContext.Provider value={makeSequenceContext(premounting)}>
		{events ? <BufferingEvents events={events} /> : null}
		<CanvasImage src="test.png" pauseWhenLoading width={100} height={50} />
	</SequenceContext.Provider>
);

const SequenceRegistrationWrapper: React.FC<{
	readonly children: React.ReactNode;
	readonly onRegisterSequence: (sequence: TSequence) => void;
}> = ({children, onRegisterSequence}) => {
	const registerSequence = React.useCallback(
		(sequence: TSequence) => {
			onRegisterSequence(sequence);
		},
		[onRegisterSequence],
	);
	const unregisterSequence = React.useCallback(() => undefined, []);
	const sequenceManagerContext: SequenceManagerContext = React.useMemo(
		() => ({
			registerSequence,
			unregisterSequence,
			sequences: [],
		}),
		[registerSequence, unregisterSequence],
	);

	return (
		<WrapSequenceContext>
			<Internals.RemotionEnvironmentContext value={studioEnv}>
				<SequenceManager.Provider value={sequenceManagerContext}>
					{children}
				</SequenceManager.Provider>
			</Internals.RemotionEnvironmentContext>
		</WrapSequenceContext>
	);
};

beforeEach(() => {
	drawImageCalls.length = 0;
	imageLoadCount = 0;
	globalThis.Image = MockImage as unknown as typeof Image;
	resetDelayRenderState();
});

afterEach(() => {
	cleanup();
	globalThis.Image = OriginalImage;
	globalThis.requestAnimationFrame = OriginalRequestAnimationFrame;
	globalThis.cancelAnimationFrame = OriginalCancelAnimationFrame;
	resetDelayRenderState();
});

test('<CanvasImage> renders a canvas element with the decoded image dimensions', async () => {
	const {container} = render(
		<WrapSequenceContext>
			<CanvasImage src="test.png" />
		</WrapSequenceContext>,
	);

	const canvas = container.querySelector('canvas');
	expect(canvas?.tagName).toBe('CANVAS');

	await waitFor(() => {
		expect(canvas?.width).toBe(200);
		expect(canvas?.height).toBe(100);
	});
});

test('<CanvasImage> forwards a canvas ref', async () => {
	const ref = React.createRef<HTMLCanvasElement>();

	render(
		<WrapSequenceContext>
			<CanvasImage ref={ref} src="test.png" width={120} height={80} />
		</WrapSequenceContext>,
	);

	await waitFor(() => {
		expect(ref.current?.tagName).toBe('CANVAS');
		expect(ref.current?.getAttribute('width')).toBe('120');
		expect(ref.current?.getAttribute('height')).toBe('80');
	});
});

test('<CanvasImage> registers its canvas as the outline ref', async () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceRegistrationWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<CanvasImage src="test.png" width={120} height={80} />
		</SequenceRegistrationWrapper>,
	);

	await waitFor(() => {
		expect(registeredSequences[0]?.refForOutline?.current?.tagName).toBe(
			'CANVAS',
		);
	});
});

test('<CanvasImage> exposes non-keyframable premounting schema fields', () => {
	expect(canvasImageSchema.premountFor.keyframable).toBe(false);
	expect(canvasImageSchema.postmountFor.keyframable).toBe(false);
});

test('<CanvasImage> hides the canvas while premounted and postmounted', async () => {
	const premounted = render(
		wrapCanvasImage(
			<CanvasImage
				src="test.png"
				from={10}
				durationInFrames={20}
				premountFor={10}
				style={{opacity: 0.5}}
			/>,
		),
	);
	const premountedStyle = premounted.container
		.querySelector('canvas')
		?.getAttribute('style');
	expect(premountedStyle).toContain('display: none');
	expect(premountedStyle).toContain('pointer-events: none');
	expect(premountedStyle).toContain('opacity: 0.5');
	await waitFor(() => {
		expect(getDelayRenderState().remotion_renderReady).toBe(true);
	});
	premounted.unmount();

	const postmounted = render(
		wrapCanvasImage(
			<CanvasImage
				src="test.png"
				from={10}
				durationInFrames={20}
				postmountFor={10}
			/>,
			35,
		),
	);
	const postmountedStyle = postmounted.container
		.querySelector('canvas')
		?.getAttribute('style');
	expect(postmountedStyle).toContain('display: none');
	expect(postmountedStyle).toContain('pointer-events: none');
	await waitFor(() => {
		expect(getDelayRenderState().remotion_renderReady).toBe(true);
	});
});

test('<CanvasImage> allows overriding the premount and postmount styles', async () => {
	const premounted = render(
		wrapCanvasImage(
			<CanvasImage
				src="test.png"
				from={10}
				durationInFrames={20}
				premountFor={10}
				styleWhilePremounted={{display: 'block', opacity: 0.25}}
			/>,
		),
	);
	const premountedStyle = premounted.container
		.querySelector('canvas')
		?.getAttribute('style');
	expect(premountedStyle).toContain('display: block');
	expect(premountedStyle).toContain('opacity: 0.25');
	await waitFor(() => {
		expect(getDelayRenderState().remotion_renderReady).toBe(true);
	});
	premounted.unmount();

	const postmounted = render(
		wrapCanvasImage(
			<CanvasImage
				src="test.png"
				from={10}
				durationInFrames={20}
				postmountFor={10}
				styleWhilePostmounted={{display: 'block', opacity: 0.75}}
			/>,
			35,
		),
	);
	const postmountedStyle = postmounted.container
		.querySelector('canvas')
		?.getAttribute('style');
	expect(postmountedStyle).toContain('display: block');
	expect(postmountedStyle).toContain('opacity: 0.75');
	await waitFor(() => {
		expect(getDelayRenderState().remotion_renderReady).toBe(true);
	});
});

test('<CanvasImage> registers premount and postmount ranges once', async () => {
	const registeredSequences: TSequence[] = [];

	render(
		<SequenceRegistrationWrapper
			onRegisterSequence={(sequence) => {
				registeredSequences.push(sequence);
			}}
		>
			<CanvasImage
				src="test.png"
				from={10}
				durationInFrames={20}
				premountFor={10}
				postmountFor={5}
			/>
		</SequenceRegistrationWrapper>,
	);

	await waitFor(() => {
		expect(registeredSequences).toHaveLength(1);
	});
	expect(registeredSequences[0].type).toBe('image');
	expect(registeredSequences[0].premountDisplay).toBe(10);
	expect(registeredSequences[0].postmountDisplay).toBe(5);
});

test('<CanvasImage> applies contain fit when drawing into the source canvas', async () => {
	render(
		<WrapSequenceContext>
			<CanvasImage src="test.png" width={100} height={100} fit="contain" />
		</WrapSequenceContext>,
	);

	await waitFor(() => {
		expect(drawImageCalls.length).toBeGreaterThanOrEqual(1);
	});

	expect(drawImageCalls[0].args.slice(1)).toEqual([
		0, 0, 200, 100, 0, 25, 100, 50,
	]);
});

test('<CanvasImage> applies cover fit when drawing into the source canvas', async () => {
	render(
		<WrapSequenceContext>
			<CanvasImage src="test.png" width={100} height={100} fit="cover" />
		</WrapSequenceContext>,
	);

	await waitFor(() => {
		expect(drawImageCalls.length).toBeGreaterThanOrEqual(1);
	});

	expect(drawImageCalls[0].args.slice(1)).toEqual([
		0, 0, 200, 100, -50, 0, 200, 100,
	]);
});

test('<CanvasImage> runs static images through an effect chain', async () => {
	const applyCalls: EffectApplyParams<unknown, unknown>[] = [];
	const definition: EffectDefinition<unknown> = {
		type: 'test-effect',
		label: 'Test effect',
		documentationLink: null,
		backend: '2d',
		calculateKey: () => 'test-effect',
		setup: () => ({}),
		apply: (params) => {
			applyCalls.push(params);
			params.target
				.getContext('2d')
				?.drawImage(params.source, 0, 0, params.width, params.height);
		},
		cleanup: () => undefined,
		schema: {},
		validateParams: () => undefined,
	};
	const effect: EffectDescriptor<unknown> = {
		definition,
		effectKey: 'test-effect',
		params: {},
		memoized: false,
	};

	render(
		<WrapSequenceContext>
			<CanvasImage src="test.png" width={100} height={50} effects={[effect]} />
		</WrapSequenceContext>,
	);

	await waitFor(() => {
		expect(applyCalls).toHaveLength(1);
	});

	expect(applyCalls[0].width).toBe(100);
	expect(applyCalls[0].height).toBe(50);
	expect(applyCalls[0].source).toBeInstanceOf(HTMLCanvasElement);
});

test('<CanvasImage> keeps rendering delayed until the image is drawn into the canvas', async () => {
	const decodeResolver: {current: (() => void) | null} = {current: null};
	class DeferredDecodeImage extends MockImage {
		public decode = () =>
			new Promise<void>((resolve) => {
				decodeResolver.current = resolve;
			});
	}

	globalThis.Image = DeferredDecodeImage as unknown as typeof Image;

	const applyCalls: EffectApplyParams<unknown, unknown>[] = [];
	const definition: EffectDefinition<unknown> = {
		type: 'test-effect',
		label: 'Test effect',
		documentationLink: null,
		backend: '2d',
		calculateKey: () => 'test-effect',
		setup: () => ({}),
		apply: (params) => {
			applyCalls.push(params);
			params.target
				.getContext('2d')
				?.drawImage(params.source, 0, 0, params.width, params.height);
		},
		cleanup: () => undefined,
		schema: {},
		validateParams: () => undefined,
	};
	const effect: EffectDescriptor<unknown> = {
		definition,
		effectKey: 'test-effect',
		params: {},
		memoized: false,
	};

	render(
		<WrapSequenceContext>
			<CanvasImage src="test.png" width={100} height={50} effects={[effect]} />
		</WrapSequenceContext>,
	);

	await waitFor(() => {
		expect(decodeResolver.current).not.toBeNull();
	});
	expect(getDelayRenderState().remotion_renderReady).toBe(false);

	decodeResolver.current?.();
	await Promise.resolve();
	await Promise.resolve();

	expect(getDelayRenderState().remotion_renderReady).toBe(false);

	await waitFor(() => {
		expect(applyCalls).toHaveLength(1);
		expect(getDelayRenderState().remotion_renderReady).toBe(true);
	});
});

test('<CanvasImage> keeps rendering delayed until the drawn canvas is presented', async () => {
	const animationFrameCallbacks: FrameRequestCallback[] = [];
	globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
		animationFrameCallbacks.push(callback);
		return animationFrameCallbacks.length;
	}) as typeof requestAnimationFrame;
	globalThis.cancelAnimationFrame = ((handle: number) => {
		animationFrameCallbacks[handle - 1] = () => undefined;
	}) as typeof cancelAnimationFrame;

	const applyCalls: EffectApplyParams<unknown, unknown>[] = [];
	const definition: EffectDefinition<unknown> = {
		type: 'test-effect',
		label: 'Test effect',
		documentationLink: null,
		backend: '2d',
		calculateKey: () => 'test-effect',
		setup: () => ({}),
		apply: (params) => {
			applyCalls.push(params);
			params.target
				.getContext('2d')
				?.drawImage(params.source, 0, 0, params.width, params.height);
		},
		cleanup: () => undefined,
		schema: {},
		validateParams: () => undefined,
	};
	const effect: EffectDescriptor<unknown> = {
		definition,
		effectKey: 'test-effect',
		params: {},
		memoized: false,
	};

	render(
		<WrapSequenceContext>
			<CanvasImage src="test.png" width={100} height={50} effects={[effect]} />
		</WrapSequenceContext>,
	);

	await waitFor(() => {
		expect(applyCalls).toHaveLength(1);
		expect(animationFrameCallbacks).toHaveLength(1);
	});

	expect(getDelayRenderState().remotion_renderReady).toBe(false);

	animationFrameCallbacks[0](performance.now());
	await Promise.resolve();

	expect(getDelayRenderState().remotion_renderReady).toBe(true);
});

test('<CanvasImage> does not reload when premounting ends after drawing', async () => {
	const {rerender} = render(
		wrapCanvasImage(canvasImageInSequence({premounting: true})),
	);

	await waitFor(() => {
		expect(getDelayRenderState().remotion_renderReady).toBe(true);
	});
	expect(imageLoadCount).toBe(1);

	rerender(wrapCanvasImage(canvasImageInSequence({premounting: false})));

	expect(imageLoadCount).toBe(1);
});

test('<CanvasImage> buffers playback when premounting ends before drawing finishes', async () => {
	const events: string[] = [];
	let decodeResolver: (() => void) | null = null;
	class DeferredDecodeImage extends MockImage {
		public decode = () =>
			new Promise<void>((resolve) => {
				decodeResolver = resolve;
			});
	}

	globalThis.Image = DeferredDecodeImage as unknown as typeof Image;

	const {rerender} = render(
		wrapCanvasImage(canvasImageInSequence({events, premounting: true})),
	);

	await waitFor(() => {
		expect(decodeResolver).not.toBeNull();
	});
	expect(events).toEqual([]);

	rerender(
		wrapCanvasImage(canvasImageInSequence({events, premounting: false})),
	);

	await waitFor(() => {
		expect(events).toEqual(['waiting']);
	});

	act(() => {
		decodeResolver?.();
	});

	await waitFor(() => {
		expect(events).toEqual(['waiting', 'resume']);
	});
	expect(imageLoadCount).toBe(1);
});

test('<CanvasImage> does not reload the source image when effect keys change', async () => {
	const applyCalls: EffectApplyParams<unknown, unknown>[] = [];
	const definition: EffectDefinition<unknown> = {
		type: 'test-effect',
		label: 'Test effect',
		documentationLink: null,
		backend: '2d',
		calculateKey: (params) =>
			`test-effect-${(params as {readonly amount: number}).amount}`,
		setup: () => ({}),
		apply: (params) => {
			applyCalls.push(params);
			params.target
				.getContext('2d')
				?.drawImage(params.source, 0, 0, params.width, params.height);
		},
		cleanup: () => undefined,
		schema: {},
		validateParams: () => undefined,
	};

	const {rerender} = render(
		<WrapSequenceContext>
			<CanvasImage
				src="test.png"
				width={100}
				height={50}
				effects={[
					{
						definition,
						effectKey: 'test-effect-0',
						params: {amount: 0},
						memoized: false,
					},
				]}
			/>
		</WrapSequenceContext>,
	);

	await waitFor(() => {
		expect(applyCalls).toHaveLength(1);
	});

	expect(imageLoadCount).toBe(1);

	rerender(
		<WrapSequenceContext>
			<CanvasImage
				src="test.png"
				width={100}
				height={50}
				effects={[
					{
						definition,
						effectKey: 'test-effect-1',
						params: {amount: 1},
						memoized: false,
					},
				]}
			/>
		</WrapSequenceContext>,
	);

	await waitFor(() => {
		expect(applyCalls).toHaveLength(2);
	});

	expect(imageLoadCount).toBe(1);
});
