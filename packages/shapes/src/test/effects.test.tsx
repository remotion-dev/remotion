import {expect, mock, test} from 'bun:test';
import React from 'react';
import type {EffectsProp, HtmlInCanvasPixelDensity} from 'remotion';
import {render} from './test-utils';

type HtmlInCanvasCall = {
	readonly width: number;
	readonly height: number;
	readonly effects: EffectsProp;
	readonly pixelDensity: HtmlInCanvasPixelDensity | undefined;
	readonly style: React.CSSProperties | undefined;
	readonly stack: string | undefined;
};

const htmlInCanvasCalls: HtmlInCanvasCall[] = [];
const stackTraceComponents: unknown[] = [];
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
			style,
			stack,
		}: HtmlInCanvasCall & {
			readonly children: React.ReactNode;
		}) => {
			htmlInCanvasCalls.push({
				width,
				height,
				effects,
				pixelDensity,
				style,
				stack,
			});

			return (
				<div
					data-height={height}
					data-testid="html-in-canvas"
					data-width={width}
				>
					{children}
				</div>
			);
		},
		Internals: {
			addSequenceStackTraces,
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
	htmlInCanvasCalls.length = 0;

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
			style: {
				overflow: 'visible',
				opacity: 0.5,
			},
			stack: undefined,
		},
	]);
});

test('Should keep rendering SVG directly with no effects', async () => {
	const {Circle} = await loadComponents();
	htmlInCanvasCalls.length = 0;

	const {container} = render(
		<Circle radius={100} fill="green" stroke="red" effects={[]} />,
	);

	expect(container.querySelector('[data-testid="html-in-canvas"]')).toBe(null);
	expect(container.querySelector('svg')).not.toBe(null);
	expect(htmlInCanvasCalls).toEqual([]);
});

test('Should pass integer dimensions to HtmlInCanvas', async () => {
	const {Rect} = await loadComponents();
	htmlInCanvasCalls.length = 0;

	render(<Rect width={10.1} height={20.2} effects={[effect]} />);

	expect(htmlInCanvasCalls[0].width).toBe(11);
	expect(htmlInCanvasCalls[0].height).toBe(21);
});

test('Should forward stack to HtmlInCanvas', async () => {
	const {Circle} = await loadComponents();
	htmlInCanvasCalls.length = 0;

	render(<Circle radius={100} effects={[effect]} stack="shape-stack" />);

	expect(htmlInCanvasCalls[0].stack).toBe('shape-stack');
});

test('Should register shape components for stack traces', async () => {
	const [
		{Arrow},
		{Circle},
		{Ellipse},
		{Heart},
		{Pie},
		{Polygon},
		{Rect},
		{Star},
		{Triangle},
	] = await Promise.all([
		import('../components/arrow'),
		import('../components/circle'),
		import('../components/ellipse'),
		import('../components/heart'),
		import('../components/pie'),
		import('../components/polygon'),
		import('../components/rect'),
		import('../components/star'),
		import('../components/triangle'),
	]);

	expect(stackTraceComponents).toContain(Arrow);
	expect(stackTraceComponents).toContain(Circle);
	expect(stackTraceComponents).toContain(Ellipse);
	expect(stackTraceComponents).toContain(Heart);
	expect(stackTraceComponents).toContain(Pie);
	expect(stackTraceComponents).toContain(Polygon);
	expect(stackTraceComponents).toContain(Rect);
	expect(stackTraceComponents).toContain(Star);
	expect(stackTraceComponents).toContain(Triangle);
});
