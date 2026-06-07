import {expect, mock, test} from 'bun:test';
import React from 'react';
import type {EffectsProp, HtmlInCanvasPixelDensity} from 'remotion';
import {render} from './test-utils';

type HtmlInCanvasCall = {
	readonly width: number;
	readonly height: number;
	readonly effects: EffectsProp;
	readonly pixelDensity: HtmlInCanvasPixelDensity | undefined;
	readonly showInTimeline: boolean | undefined;
	readonly style: React.CSSProperties | undefined;
	readonly _experimentalControls: unknown;
};

type SequenceCall = {
	readonly layout: string | undefined;
	readonly from: number | undefined;
	readonly durationInFrames: number | undefined;
	readonly hidden: boolean | undefined;
	readonly name: string | undefined;
	readonly showInTimeline: boolean | undefined;
	readonly _experimentalControls: unknown;
	readonly _remotionInternalDocumentationLink: string | undefined;
	readonly _remotionInternalEffects: unknown;
	readonly _remotionInternalRefForOutline:
		| React.RefObject<Element | null>
		| undefined;
	readonly stack: string | undefined;
};

const htmlInCanvasCalls: HtmlInCanvasCall[] = [];
const sequenceCalls: SequenceCall[] = [];
const stackTraceComponents: unknown[] = [];
const effectDefinitions = [{type: 'effect-definition'}];
let hasVideoConfig = true;
const addSequenceStackTraces = mock((component: unknown) => {
	stackTraceComponents.push(component);
});

mock.module('remotion', () => {
	return {
		HtmlInCanvas: ({
			children,
			width,
			height,
			effects,
			pixelDensity,
			showInTimeline,
			style,
			_experimentalControls,
			ref,
		}: HtmlInCanvasCall & {
			readonly children: React.ReactNode;
			readonly ref?: React.Ref<HTMLCanvasElement>;
		}) => {
			htmlInCanvasCalls.push({
				width,
				height,
				effects,
				pixelDensity,
				showInTimeline,
				style,
				_experimentalControls,
			});

			return (
				<canvas
					ref={ref}
					data-height={height}
					data-testid="html-in-canvas"
					data-width={width}
				>
					{children}
				</canvas>
			);
		},
		Internals: {
			addSequenceStackTraces,
			CanUseRemotionHooks: React.createContext(true),
			CompositionManagerProvider: ({
				children,
			}: {
				readonly children: React.ReactNode;
			}) => children,
			RemotionRootContexts: ({
				children,
			}: {
				readonly children: React.ReactNode;
			}) => children,
			ResolveCompositionContext: React.createContext({}),
			sequenceSchema: {
				durationInFrames: {},
				from: {},
				hidden: {},
			},
			sequenceVisualStyleSchema: {},
			useUnsafeVideoConfig: mock(() =>
				hasVideoConfig
					? {
							id: 'shape-test',
							width: 1920,
							height: 1080,
							fps: 30,
							durationInFrames: 100,
							defaultProps: {},
							props: {},
							defaultCodec: null,
							defaultOutName: null,
							defaultVideoImageFormat: null,
							defaultPixelFormat: null,
							defaultProResProfile: null,
							defaultSampleRate: null,
						}
					: null,
			),
			useMemoizedEffectDefinitions: mock(() => effectDefinitions),
			wrapInSchema: mock(({Component}) => Component),
		},
		Sequence: ({
			children,
			...props
		}: SequenceCall & {
			readonly children: React.ReactNode;
		}) => {
			sequenceCalls.push(props);

			return <div data-testid="sequence">{children}</div>;
		},
	};
});

const loadComponents = async () => {
	const [{Circle}, {Rect}] = await Promise.all([
		import('../components/circle'),
		import('../components/rect'),
	]);

	return {Circle, Rect};
};

const effect = {} as EffectsProp[number];

test('Should render a shape with effects in HtmlInCanvas', async () => {
	const {Circle} = await loadComponents();
	hasVideoConfig = true;
	htmlInCanvasCalls.length = 0;
	sequenceCalls.length = 0;

	const {container} = render(
		<Circle
			radius={100}
			fill="green"
			stroke="red"
			strokeWidth={1}
			effects={[effect]}
			pixelDensity={2}
			style={{opacity: 0.5}}
		/>,
	);

	expect(container.querySelector('[data-testid="html-in-canvas"]')).not.toBe(
		null,
	);
	expect(container.querySelector('svg')).not.toBe(null);
	expect(container.querySelector('path')?.getAttribute('fill')).toBe('green');
	expect(htmlInCanvasCalls).toEqual([
		{
			width: 200,
			height: 200,
			effects: [effect],
			pixelDensity: 2,
			showInTimeline: false,
			style: {
				overflow: 'visible',
				opacity: 0.5,
			},
			_experimentalControls: undefined,
		},
	]);
	expect(sequenceCalls[0]).toMatchObject({
		layout: 'none',
		name: '<Circle>',
		_remotionInternalDocumentationLink:
			'https://www.remotion.dev/docs/shapes/circle',
		_remotionInternalEffects: effectDefinitions,
	});
	expect(
		sequenceCalls[0]._remotionInternalRefForOutline?.current?.tagName,
	).toBe('CANVAS');
});

test('Should keep rendering SVG directly with no effects', async () => {
	const {Circle} = await loadComponents();
	hasVideoConfig = true;
	htmlInCanvasCalls.length = 0;
	sequenceCalls.length = 0;

	const {container} = render(
		<Circle
			radius={100}
			fill="green"
			stroke="red"
			effects={[]}
			from={12}
			durationInFrames={23}
			showInTimeline={false}
		/>,
	);

	expect(container.querySelector('[data-testid="html-in-canvas"]')).toBe(null);
	expect(container.querySelector('svg')).not.toBe(null);
	expect(htmlInCanvasCalls).toEqual([]);
	expect(sequenceCalls[0]).toMatchObject({
		durationInFrames: 23,
		from: 12,
		layout: 'none',
		name: '<Circle>',
		showInTimeline: false,
		_remotionInternalDocumentationLink:
			'https://www.remotion.dev/docs/shapes/circle',
	});
	expect(
		sequenceCalls[0]._remotionInternalRefForOutline?.current?.tagName,
	).toBe('svg');
});

test('Should pass integer dimensions to HtmlInCanvas', async () => {
	const {Rect} = await loadComponents();
	hasVideoConfig = true;
	htmlInCanvasCalls.length = 0;

	render(<Rect width={10.1} height={20.2} effects={[effect]} />);

	expect(htmlInCanvasCalls[0].width).toBe(11);
	expect(htmlInCanvasCalls[0].height).toBe(21);
});

test('Should forward stack to the shape Sequence', async () => {
	const {Circle} = await loadComponents();
	hasVideoConfig = true;
	htmlInCanvasCalls.length = 0;
	sequenceCalls.length = 0;

	render(<Circle radius={100} effects={[effect]} stack="shape-stack" />);

	expect(htmlInCanvasCalls[0]).not.toBe(undefined);
	expect(sequenceCalls[0].stack).toBe('shape-stack');
});

test('Should not add a documentation link if a custom name is passed', async () => {
	const {Circle} = await loadComponents();
	hasVideoConfig = true;
	sequenceCalls.length = 0;

	render(<Circle radius={100} name="Custom circle" />);

	expect(sequenceCalls[0].name).toBe('Custom circle');
	expect(sequenceCalls[0]._remotionInternalDocumentationLink).toBe(undefined);
});

test('Should render SVG without Sequence outside a Remotion video config', async () => {
	const {Rect} = await loadComponents();
	hasVideoConfig = false;
	htmlInCanvasCalls.length = 0;
	sequenceCalls.length = 0;

	const {container} = render(
		<Rect width={100} height={50} fill="red" style={{opacity: 0.5}} />,
	);

	expect(container.querySelector('svg')).not.toBe(null);
	expect(container.querySelector('svg')?.style.opacity).toBe('0.5');
	expect(container.querySelector('path')?.getAttribute('fill')).toBe('red');
	expect(htmlInCanvasCalls).toEqual([]);
	expect(sequenceCalls).toEqual([]);
});
