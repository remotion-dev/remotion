import {afterEach, beforeEach, expect, test} from 'bun:test';
import {cleanup, render, waitFor} from '@testing-library/react';
import React from 'react';
import {CanvasImage} from '../canvas-image/index.js';
import type {
	EffectApplyParams,
	EffectDefinition,
	EffectDescriptor,
} from '../effects/effect-types.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

type DrawImageCall = {
	readonly canvas: HTMLCanvasElement;
	readonly args: unknown[];
};

const drawImageCalls: DrawImageCall[] = [];

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
		queueMicrotask(() => this.onload?.());
	}
}

const OriginalImage = globalThis.Image;

beforeEach(() => {
	drawImageCalls.length = 0;
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
