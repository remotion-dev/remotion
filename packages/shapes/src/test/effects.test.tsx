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
};

const htmlInCanvasCalls: HtmlInCanvasCall[] = [];

mock.module('remotion', () => {
	return {
		HtmlInCanvas: ({
			children,
			width,
			height,
			effects,
			pixelDensity,
			style,
		}: HtmlInCanvasCall & {
			readonly children: React.ReactNode;
		}) => {
			htmlInCanvasCalls.push({width, height, effects, pixelDensity, style});

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
	};
});

const {Circle} = await import('../components/circle');
const {Rect} = await import('../components/rect');

const effect = {} as EffectsProp[number];

test('Should render a shape with effects in HtmlInCanvas', () => {
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
		},
	]);
});

test('Should keep rendering SVG directly with no effects', () => {
	htmlInCanvasCalls.length = 0;

	const {container} = render(
		<Circle radius={100} fill="green" stroke="red" effects={[]} />,
	);

	expect(container.querySelector('[data-testid="html-in-canvas"]')).toBe(null);
	expect(container.querySelector('svg')).not.toBe(null);
	expect(htmlInCanvasCalls).toEqual([]);
});

test('Should pass integer dimensions to HtmlInCanvas', () => {
	htmlInCanvasCalls.length = 0;

	render(<Rect width={10.1} height={20.2} effects={[effect]} />);

	expect(htmlInCanvasCalls[0].width).toBe(11);
	expect(htmlInCanvasCalls[0].height).toBe(21);
});
