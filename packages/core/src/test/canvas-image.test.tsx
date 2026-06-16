import {afterEach, beforeEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React from 'react';
import {CanvasImage} from '../canvas-image/index.js';
import type {TSequence} from '../CompositionManager.js';
import type {
	EffectApplyParams,
	EffectDefinition,
	EffectDescriptor,
} from '../effects/effect-types.js';
import {Internals} from '../internals.js';
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

(
	HTMLCanvasElement.prototype as unknown as {
		getContext: (kind: string) => unknown;
	}
).getContext = function (kind: string) {
	if (kind === '2d') {
		return stub2dContext(this as HTMLCanvasElement);
	}

	return null;
};

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

const studioEnv = {
	isRendering: false,
	isClientSideRendering: false,
	isPlayer: false,
	isStudio: true,
	isReadOnlyStudio: false,
};

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
});

afterEach(() => {
	cleanup();
	globalThis.Image = OriginalImage;
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
