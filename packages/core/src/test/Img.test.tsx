import {afterEach, beforeEach, expect, test} from 'bun:test';
import {act, cleanup, fireEvent, render, waitFor} from '@testing-library/react';
import React from 'react';
import {BufferingContextReact} from '../buffering.js';
import type {
	EffectApplyParams,
	EffectDefinition,
	EffectDescriptor,
} from '../effects/effect-types.js';
import {Img, imgSchema} from '../Img.js';
import type {RemotionEnvironment} from '../remotion-environment-context.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import type {SequenceContextType} from '../SequenceContext.js';
import {SequenceContext} from '../SequenceContext.js';
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

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
	configurable: true,
	value: (kind: string) => {
		if (kind === '2d') {
			return stub2dContext();
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

const wrapImg = (
	element: React.ReactElement,
	environment: RemotionEnvironment = previewEnvironment,
	currentFrame: number = 0,
) => {
	return (
		<RemotionEnvironmentContext.Provider value={environment}>
			<WrapSequenceContext currentFrame={currentFrame}>
				{element}
			</WrapSequenceContext>
		</RemotionEnvironmentContext.Provider>
	);
};

const renderImg = (
	element: React.ReactElement,
	environment: RemotionEnvironment = previewEnvironment,
) => {
	return render(wrapImg(element, environment));
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

const forceNodeEnv = (nodeEnv: string) => {
	const originalNodeEnv = window.process.env.NODE_ENV;
	window.process.env.NODE_ENV = nodeEnv;

	return () => {
		window.process.env.NODE_ENV = originalNodeEnv;
	};
};

const imgInSequence = ({
	events,
	premounting,
}: {
	readonly events?: string[];
	readonly premounting: boolean;
}) => (
	<SequenceContext.Provider value={makeSequenceContext(premounting)}>
		{events ? <BufferingEvents events={events} /> : null}
		<Img src="blob:http://localhost/test-image" pauseWhenLoading />
	</SequenceContext.Provider>
);

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

test('<Img> does not decode again when premounting ends after loading', async () => {
	const originalDecode = HTMLImageElement.prototype.decode;
	const restoreNodeEnv = forceNodeEnv('development');
	let decodeCalls = 0;
	HTMLImageElement.prototype.decode = () => {
		decodeCalls++;
		return Promise.resolve();
	};

	try {
		const {rerender} = render(wrapImg(imgInSequence({premounting: true})));

		await waitFor(() => {
			expect(decodeCalls).toBe(1);
		});

		rerender(wrapImg(imgInSequence({premounting: false})));

		expect(decodeCalls).toBe(1);
	} finally {
		HTMLImageElement.prototype.decode = originalDecode;
		restoreNodeEnv();
	}
});

test('<Img> buffers playback when premounting ends before loading finishes', async () => {
	const originalDecode = HTMLImageElement.prototype.decode;
	const restoreNodeEnv = forceNodeEnv('development');
	const events: string[] = [];
	let decodeResolver: (() => void) | null = null;
	HTMLImageElement.prototype.decode = () =>
		new Promise<void>((resolve) => {
			decodeResolver = resolve;
		});

	try {
		const {rerender} = render(
			wrapImg(imgInSequence({events, premounting: true})),
		);

		await waitFor(() => {
			expect(decodeResolver).not.toBeNull();
		});
		expect(events).toEqual([]);

		rerender(wrapImg(imgInSequence({events, premounting: false})));

		await waitFor(() => {
			expect(events).toEqual(['waiting']);
		});

		act(() => {
			decodeResolver?.();
		});

		await waitFor(() => {
			expect(events).toEqual(['waiting', 'resume']);
		});
	} finally {
		HTMLImageElement.prototype.decode = originalDecode;
		restoreNodeEnv();
	}
});

test('<Img> does not pause playback while directly premounted', async () => {
	const originalDecode = HTMLImageElement.prototype.decode;
	const restoreNodeEnv = forceNodeEnv('development');
	const events: string[] = [];
	let decodeResolver: (() => void) | null = null;
	HTMLImageElement.prototype.decode = () =>
		new Promise<void>((resolve) => {
			decodeResolver = resolve;
		});
	const img = (
		<>
			<BufferingEvents events={events} />
			<Img
				src="blob:http://localhost/test-image"
				from={10}
				durationInFrames={20}
				premountFor={10}
				pauseWhenLoading
			/>
		</>
	);

	try {
		const {rerender} = render(wrapImg(img, previewEnvironment, 0));

		await waitFor(() => {
			expect(decodeResolver).not.toBeNull();
		});
		expect(events).toEqual([]);

		rerender(wrapImg(img, previewEnvironment, 10));

		await waitFor(() => {
			expect(events).toEqual(['waiting']);
		});

		act(() => {
			decodeResolver?.();
		});

		await waitFor(() => {
			expect(events).toEqual(['waiting', 'resume']);
		});
	} finally {
		HTMLImageElement.prototype.decode = originalDecode;
		restoreNodeEnv();
	}
});

test('<Img> does not pause playback while directly postmounted', async () => {
	const originalDecode = HTMLImageElement.prototype.decode;
	const restoreNodeEnv = forceNodeEnv('development');
	const events: string[] = [];
	let decodeStarted = false;
	HTMLImageElement.prototype.decode = () => {
		decodeStarted = true;
		return new Promise<void>(() => undefined);
	};

	try {
		render(
			wrapImg(
				<>
					<BufferingEvents events={events} />
					<Img
						src="blob:http://localhost/test-image"
						from={10}
						durationInFrames={20}
						postmountFor={10}
						pauseWhenLoading
					/>
				</>,
				previewEnvironment,
				35,
			),
		);

		await waitFor(() => {
			expect(decodeStarted).toBe(true);
		});
		expect(events).toEqual([]);
	} finally {
		HTMLImageElement.prototype.decode = originalDecode;
		restoreNodeEnv();
	}
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

test('<Img> schema exposes src but not fit', () => {
	expect(imgSchema.src).toEqual({
		type: 'asset',
		default: undefined,
		description: 'Source',
		keyframable: false,
	});
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
