import {afterEach, beforeEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import React from 'react';
import type {
	EffectApplyParams,
	EffectDefinition,
	EffectDescriptor,
} from '../effects/effect-types.js';
import {Img, imgSchema} from '../Img.js';
import type {RemotionEnvironment} from '../remotion-environment-context.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

const drawImageCalls: unknown[][] = [];
const OriginalImage = globalThis.Image;

const stub2dContext = () => ({
	fillStyle: '',
	fillRect: () => undefined,
	clearRect: () => undefined,
	drawImage: (...args: unknown[]) => {
		drawImageCalls.push(args);
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
		return stub2dContext();
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

const makeEffect = (
	applyCalls: EffectApplyParams<unknown, unknown>[] = [],
): EffectDescriptor<unknown> => {
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

	return {
		definition,
		effectKey: 'test-effect',
		params: {},
		memoized: false,
	};
};

beforeEach(() => {
	drawImageCalls.length = 0;
	globalThis.Image = MockImage as unknown as typeof Image;
});

afterEach(() => {
	cleanup();
	globalThis.Image = OriginalImage;
});

const testImgUrl = 'https://source.unsplash.com/random/50x50';

const previewEnvironment: RemotionEnvironment = {
	isClientSideRendering: false,
	isPlayer: false,
	isReadOnlyStudio: false,
	isRendering: false,
	isStudio: false,
};

const renderImg = (
	element: React.ReactElement,
	environment: RemotionEnvironment = previewEnvironment,
) => {
	return render(
		<RemotionEnvironmentContext.Provider value={environment}>
			<WrapSequenceContext>{element}</WrapSequenceContext>
		</RemotionEnvironmentContext.Provider>,
	);
};

test('Img component renders img tag', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} />);

	expect(ref.current?.tagName).toBe('IMG');
});

test('Src attribute is forwarded to img tag', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} />);

	expect(ref.current).toHaveProperty('src', testImgUrl);
});

test('Img does not force synchronous decoding outside of rendering', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} />);

	expect(ref.current?.getAttribute('decoding')).toBeNull();
});

test('Img preserves the decoding prop outside of rendering', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} decoding="async" />);

	expect(ref.current?.getAttribute('decoding')).toBe('async');
});

test('Img forces synchronous decoding while rendering', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} decoding="async" />, {
		...previewEnvironment,
		isRendering: true,
	});

	expect(ref.current?.getAttribute('decoding')).toBe('sync');
});

test('Img with an empty effects array still renders an img tag', () => {
	const ref = React.createRef<HTMLImageElement>();
	renderImg(<Img ref={ref} src={testImgUrl} effects={[]} />);

	expect(ref.current?.tagName).toBe('IMG');
});

test('Img with effects renders through the canvas image path', async () => {
	const applyCalls: EffectApplyParams<unknown, unknown>[] = [];
	const {container} = renderImg(
		<Img
			src={testImgUrl}
			width={100}
			height={50}
			effects={[makeEffect(applyCalls)]}
		/>,
	);

	const canvas = container.querySelector('canvas');
	expect(canvas?.tagName).toBe('CANVAS');

	await waitFor(() => {
		expect(applyCalls).toHaveLength(1);
	});

	expect(applyCalls[0].width).toBe(100);
	expect(applyCalls[0].height).toBe(50);
});

test('<Img> schema does not expose fit', () => {
	expect(Object.keys(imgSchema)).not.toContain('fit');
});

test('Img throws when native image props conflict with effects', () => {
	expect(() =>
		renderImg(
			<Img
				src={testImgUrl}
				srcSet={`${testImgUrl} 1x`}
				effects={[makeEffect()]}
			/>,
		),
	).toThrow(
		'The "srcSet" prop cannot be used on <Img> when effects are passed',
	);
});

test('Img forwards canvas-compatible attributes when effects are passed', async () => {
	const onClick = () => {
		drawImageCalls.push(['clicked']);
	};

	const {container} = renderImg(
		<Img
			src={testImgUrl}
			width={100}
			height={50}
			effects={[makeEffect()]}
			aria-label="Image with effects"
			data-testid="img-effects-canvas"
			role="img"
			tabIndex={0}
			title="Canvas image"
			onClick={onClick}
		/>,
	);

	const canvas = container.querySelector('canvas');

	await waitFor(() => {
		expect(canvas?.width).toBe(100);
	});

	expect(canvas?.getAttribute('aria-label')).toBe('Image with effects');
	expect(canvas?.getAttribute('data-testid')).toBe('img-effects-canvas');
	expect(canvas?.getAttribute('role')).toBe('img');
	expect(canvas?.getAttribute('tabindex')).toBe('0');
	expect(canvas?.getAttribute('title')).toBe('Canvas image');

	fireEvent.click(canvas as HTMLCanvasElement);
	expect(drawImageCalls.some((call) => call[0] === 'clicked')).toBe(true);
});

test('Img forwards objectFit to the canvas backend when effects are passed', async () => {
	renderImg(
		<Img
			src={testImgUrl}
			width={100}
			height={100}
			style={{objectFit: 'contain'}}
			effects={[makeEffect()]}
		/>,
	);

	await waitFor(() => {
		expect(drawImageCalls.length).toBeGreaterThanOrEqual(1);
	});

	expect(drawImageCalls[0].slice(1)).toEqual([0, 0, 200, 100, 0, 25, 100, 50]);
});

test('Img throws when a ref is passed together with effects', () => {
	const ref = React.createRef<HTMLImageElement>();

	expect(() =>
		renderImg(<Img ref={ref} src={testImgUrl} effects={[makeEffect()]} />),
	).toThrow('The "ref" prop cannot be used on <Img> when effects are passed');
});
