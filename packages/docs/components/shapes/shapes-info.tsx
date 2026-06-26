import {
	makeArrow,
	makeCallout,
	makeCircle,
	makeEllipse,
	makeHeart,
	makePie,
	makePolygon,
	makeRect,
	makeSpark,
	makeStar,
	makeTriangle,
} from '@remotion/shapes';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {AvailableFrom} from '../../src/components/AvailableFrom';
import {
	DebugOption,
	RectEdgeRoundness,
	TriangleEdgeRoundness,
} from './edge-roundness';

type Param = {
	name: string;
	type: string;
	description: React.ReactNode;
};

export type ShapeName =
	| 'Arrow'
	| 'Callout'
	| 'Circle'
	| 'Ellipse'
	| 'Heart'
	| 'Pie'
	| 'Polygon'
	| 'Rect'
	| 'Spark'
	| 'Star'
	| 'Triangle';

export type ShapeComponent = {
	shape: ShapeName;
	fn: (options: unknown) => unknown;
	params: Param[];
};

export const shapeComponents: ShapeComponent[] = [
	{
		shape: 'Arrow',
		fn: makeArrow,
		params: [
			{
				name: 'length',
				type: 'number',
				description:
					'The total length of the arrow along its direction axis. Default 300.',
				hiddenFromList: false,
			},
			{
				name: 'headWidth',
				type: 'number',
				description:
					'The width of the arrowhead at its widest point. Default 185.',
				hiddenFromList: false,
			},
			{
				name: 'headLength',
				type: 'number',
				description: 'The length of the arrowhead portion. Default 120.',
				hiddenFromList: false,
			},
			{
				name: 'shaftWidth',
				type: 'number',
				description: 'The width of the arrow shaft. Default 80.',
				hiddenFromList: false,
			},
			{
				name: 'direction',
				type: '"left" | "right" | "up" | "down"',
				description: 'The direction the arrow points. Default right.',
			},
			{
				name: 'cornerRadius',
				type: 'number',
				description:
					"Rounds the corner using an arc. Similar to CSS's border-radius.",
				hiddenFromList: false,
			},
		],
	},
	{
		shape: 'Rect',
		fn: makeRect,
		params: [
			{
				name: 'width',
				type: 'number',
				description: 'The width of the rectangle.',
				hiddenFromList: false,
			},
			{
				name: 'height',
				type: 'number',
				description: 'The height of the rectangle.',
				hiddenFromList: false,
			},
		],
	},
	{
		shape: 'Callout',
		fn: makeCallout,
		params: [
			{
				name: 'width',
				type: 'number',
				description: 'The width of the callout body. Default 500.',
				hiddenFromList: false,
			},
			{
				name: 'height',
				type: 'number',
				description: 'The height of the callout body. Default 200.',
				hiddenFromList: false,
			},
			{
				name: 'pointerLength',
				type: 'number',
				description: 'The length of the pointer. Default 40.',
				hiddenFromList: false,
			},
			{
				name: 'pointerBaseWidth',
				type: 'number',
				description:
					'The width of the pointer where it meets the body. Default 60.',
				hiddenFromList: false,
			},
			{
				name: 'pointerPosition',
				type: 'number',
				description:
					'The position of the pointer along its side, from 0 to 1. Default 0.5.',
				hiddenFromList: false,
			},
			{
				name: 'pointerDirection',
				type: '"left" | "right" | "up" | "down"',
				description: 'The direction the pointer points. Default down.',
			},
			{
				name: 'edgeRoundness',
				type: 'number | null',
				description:
					'Allows to modify the shape by rounding the edges using bezier curves. Default null.',
			},
		],
	},
	{
		shape: 'Circle',
		fn: makeCircle,
		params: [
			{
				name: 'radius',
				type: 'number',
				description: 'The radius of the circle.',
				hiddenFromList: false,
			},
		],
	},
	{
		shape: 'Heart',
		fn: makeHeart,
		params: [
			{
				name: 'height',
				type: 'number',
				description: 'The height of the heart.',
				hiddenFromList: false,
			},
			{
				name: 'aspectRatio',
				type: 'number',
				description: 'The aspect ratio of the heart. Default 1.1.',
				hiddenFromList: false,
			},
			{
				name: 'bottomRoundnessAdjustment',
				type: 'number',
				description:
					'The amount of bottom roundness deviation from the default. Negative values make the bottom point sharper, positive values make it rounder.',
				hiddenFromList: false,
			},
			{
				name: 'depthAdjustment',
				type: 'number',
				description:
					'The deviation of the default depth (how deep the top of the heart is). Negative values make the heart deeper, positive values make it shallower.',
				hiddenFromList: false,
			},
		],
	},
	{
		shape: 'Pie',
		fn: makePie,
		params: [
			{
				name: 'radius',
				type: 'number',
				description: 'The radius of the circle.',
				hiddenFromList: false,
			},
			{
				name: 'progress',
				type: 'number',
				description: (
					<>
						The percentage of the circle that is filled. <code>0</code> means
						fully empty, <code>1</code> means fully filled.
					</>
				),
				hiddenFromList: false,
			},
			{
				name: 'counterClockwise',
				type: 'boolean',
				description:
					'If set, the circle gets filled counterclockwise instead of clockwise. Default false.',
			},
			{
				name: 'closePath',
				type: 'boolean',
				description: (
					<>
						If set to <code>false</code>, no path to the middle of the circle
						will be drawn, leading to an open arc. Default <code>true</code>.
					</>
				),
			},
			{
				name: 'rotation',
				type: 'number',
				description: (
					<>
						Add rotation to the path. <code>0</code> means no rotation,{' '}
						<code>Math.PI * 2</code> means 1 full clockwise rotation{' '}
					</>
				),
				hiddenFromList: false,
			},
		],
	},
	{
		shape: 'Ellipse',
		fn: makeEllipse,
		params: [
			{
				name: 'rx',
				type: 'number',
				description: 'The radius of the ellipse on the X axis.',
				hiddenFromList: false,
			},
			{
				name: 'ry',
				type: 'number',
				description: 'The radius of the ellipse on the Y axis.',
				hiddenFromList: false,
			},
		],
	},
	{
		shape: 'Triangle',
		fn: makeTriangle,
		params: [
			{
				name: 'length',
				type: 'number',
				description: 'The length of one triangle side.',
				hiddenFromList: false,
			},
			{
				name: 'direction',
				type: '"left" | "right" | "up" | "down"',
				description: 'The direction of the triangle.',
			},
		],
	},
	{
		shape: 'Star',
		fn: makeStar,
		params: [
			{
				name: 'points',
				type: 'number',
				description: 'The amount of points of the star.',
				hiddenFromList: false,
			},
			{
				name: 'innerRadius',
				type: 'number',
				description: 'The inner radius of the star.',
				hiddenFromList: false,
			},
			{
				name: 'outerRadius',
				type: 'number',
				description: 'The outer radius of the star.',
				hiddenFromList: false,
			},
		],
	},
	{
		shape: 'Spark',
		fn: makeSpark,
		params: [
			{
				name: 'width',
				type: 'number',
				description: 'The width of the spark.',
				hiddenFromList: false,
			},
			{
				name: 'height',
				type: 'number',
				description: 'The height of the spark.',
				hiddenFromList: false,
			},
			{
				name: 'edgeRoundness',
				type: 'number',
				description:
					'Controls the inward curvature of the edges between the four points. Default 1.',
				hiddenFromList: false,
			},
			{
				name: 'cornerRadius',
				type: 'number',
				description: 'Rounds the four points of the spark. Default 0.',
				hiddenFromList: false,
			},
		],
	},
	{
		shape: 'Polygon',
		fn: makePolygon,
		params: [
			{
				name: 'points',
				type: 'number',
				description: 'The number of points in the polygon.',
				hiddenFromList: false,
			},
			{
				name: 'radius',
				type: 'number',
				description: 'The radius of the polygon.',
				hiddenFromList: false,
			},
			{
				name: 'edgeRoundness',
				type: 'number | null',
				description:
					'Allows to modify the shape by rounding the edges using bezier curves. Default null.',
			},
			{
				name: 'cornerRadius',
				type: 'number',
				description:
					"Rounds the corner using an arc. Similar to CSS's border-radius. Cannot be used together with edgeRoundness.",
				hiddenFromList: false,
			},
		],
	},
];

export const shapeNames: readonly ShapeName[] = shapeComponents.map(
	(component) => component.shape,
);

const globalParams: Param[] = [
	{
		name: 'fill',
		type: 'string',
		description: 'The color of the shape.',
	},
	{
		name: 'stroke',
		type: 'string',
		description: (
			<>
				The color of the stroke. Should be used together with{' '}
				<code>strokeWidth</code>.
			</>
		),
	},
	{
		name: 'strokeWidth',
		type: 'string',
		description: (
			<>
				The width of the stroke. Should be used together with{' '}
				<code>stroke</code>.
			</>
		),
	},
	{
		name: 'style',
		type: 'string',
		description: (
			<>
				CSS properties that will be applied to the <code>{'<svg>'}</code> tag,
				or to the generated <code>{'<canvas>'}</code> if <code>effects</code>{' '}
				are passed. Default style: <code>{"overflow: 'visible'"}</code>
			</>
		),
	},
	{
		name: 'pathStyle',
		type: 'string',
		description: (
			<>
				CSS properties that will be applied to the <code>{'<path>'}</code> tag.
				Default style: <code>{"transform-box: 'fill-box'"}</code> and a
				dynamically calculated <code>{'transform-origin'}</code> which is the
				center of the shape, so that the shape rotates around its center by
				default.
			</>
		),
	},

	{
		name: 'strokeDasharray',
		type: 'string',
		description: (
			<>
				Allows to animate a path. See{' '}
				<a href="/docs/paths/evolve-path">evolvePath()</a> for an example.
			</>
		),
	},
	{
		name: 'strokeDashoffset',
		type: 'string',
		description: (
			<>
				Allows to animate a path. See{' '}
				<a href="/docs/paths/evolve-path">evolvePath()</a> for an example.
			</>
		),
	},
	{
		name: 'effects',
		type: 'EffectsProp',
		description: (
			<>
				Apply <a href="/docs/effects/api">effects</a> after the shape has been
				painted to a canvas. Available from v4.0.474. If this is a non-empty
				array, the shape is wrapped in{' '}
				<a href="/docs/remotion/html-in-canvas">
					<code>{'<HtmlInCanvas>'}</code>
				</a>
				.
			</>
		),
	},
	{
		name: 'pixelDensity',
		type: 'number',
		description: (
			<>
				Controls the backing bitmap density when <code>effects</code> are
				passed. Default: <code>1</code>. Available from v4.0.474.
			</>
		),
	},
];

export const ShapeOptions: React.FC<{
	readonly shape: string;
	readonly all: boolean;
}> = ({shape, all}) => {
	const shapeComponent = shapeComponents.find(
		(c) => c.shape.toLowerCase() === shape.toLowerCase(),
	);

	if (!shapeComponent) {
		throw new Error('no');
	}

	return (
		<React.Fragment>
			{(all
				? [...shapeComponent.params, ...globalParams]
				: shapeComponent.params
			).map((p) => {
				return (
					<React.Fragment key={p.name}>
						<h3>
							<code>{p.name}</code>
						</h3>
						<p>
							<em>{p.type}</em>
						</p>
						<p>{p.description}</p>
					</React.Fragment>
				);
			})}
			{all &&
			(shapeComponent.shape === 'Rect' ||
				shapeComponent.shape === 'Callout' ||
				shapeComponent.shape === 'Triangle' ||
				shapeComponent.shape === 'Polygon') ? (
				<>
					<h3>
						<code>cornerRadius</code>
					</h3>
					<p>
						<em>number</em>
					</p>
					<p>
						Rounds the corner using an arc. Similar to {"CSS's"}{' '}
						<code>border-radius</code>. Cannot be used together with{' '}
						<code>edgeRoundness</code>.
					</p>
				</>
			) : null}

			{shapeComponent.shape === 'Rect' ? <RectEdgeRoundness /> : null}
			{shapeComponent.shape === 'Triangle' ? <TriangleEdgeRoundness /> : null}
			{all &&
			(shapeComponent.shape === 'Rect' ||
				shapeComponent.shape === 'Callout' ||
				shapeComponent.shape === 'Triangle') ? (
				<DebugOption />
			) : null}
			{all ? (
				<>
					<h3>
						Inherited props
						<AvailableFrom v="4.0.474" />
					</h3>
					<p>
						<code>{`<${shapeComponent.shape}>`}</code> inherits{' '}
						<a href="/docs/sequence#from">
							<code>from</code>
						</a>
						,{' '}
						<a href="/docs/sequence#durationinframes">
							<code>durationInFrames</code>
						</a>
						,{' '}
						<a href="/docs/sequence#trimbefore">
							<code>trimBefore</code>
						</a>
						<AvailableFrom v="4.0.482" inline />,{' '}
						<a href="/docs/sequence#name">
							<code>name</code>
						</a>
						,{' '}
						<a href="/docs/sequence#showintimeline">
							<code>showInTimeline</code>
						</a>{' '}
						and{' '}
						<a href="/docs/sequence#hidden">
							<code>hidden</code>
						</a>{' '}
						from <a href="/docs/sequence">{'<Sequence>'}</a>.
					</p>
					<h3>Other props</h3>{' '}
					<p>
						All other props that can be passed to a <code>{'<path>'}</code> are
						accepted and will be forwarded.
					</p>
				</>
			) : null}
		</React.Fragment>
	);
};

export const MakeShapeReturnType: React.FC<{
	readonly shape: string;
	readonly includeComponentLink?: boolean;
}> = ({shape, includeComponentLink = true}) => {
	const shapeComponent = shapeComponents.find(
		(c) => c.shape.toLowerCase() === shape.toLowerCase(),
	);

	if (!shapeComponent) {
		throw new Error('no');
	}

	return (
		<div>
			<h3>
				<code>path</code>
			</h3>
			<p>
				A string that is suitable as an argument for <code>d</code> in a{' '}
				<code>{'<path>'}</code> element.
			</p>
			<h3>
				<code>width</code>
			</h3>
			<p>
				The width of the {shapeComponent.shape.toLowerCase()}. Suitable for
				defining the <code>viewBox</code> of an <code>{'<svg>'}</code> tag.
			</p>
			<h3>
				<code>height</code>
			</h3>
			<p>
				The height of the {shapeComponent.shape.toLowerCase()}. Suitable for
				defining the <code>viewBox</code> of an <code>{'<svg>'}</code> tag.
			</p>
			<h3>
				<code>instructions</code>
			</h3>
			<p>
				An array with SVG instructions. The type for a instruction can be seen
				by importing <code>Instruction</code> from <code>@remotion/shapes</code>
				.
			</p>
			<h3>
				<code>transformOrigin</code>
			</h3>
			<p>
				A string representing the point of origin if a shape should be rotated
				around itself.
			</p>
			{includeComponentLink ? (
				<p>
					If you want to rotate the shape around its center, use the{' '}
					<code>transform-origin</code> CSS property and pass this value, and
					also add <code>transform-box: fill-box</code>. This is the default for{' '}
					<a href={`/docs/shapes/${shapeComponent.shape.toLowerCase()}`}>
						<code>{`<${shapeComponent.shape} />`}</code>
					</a>
					.
				</p>
			) : (
				<p>
					If you want to rotate the shape around its center, use the{' '}
					<code>transform-origin</code> CSS property and pass this value, and
					also add <code>transform-box: fill-box</code>.
				</p>
			)}
		</div>
	);
};

export const MakeShapeSeeAlso: React.FC<{
	readonly shape: string;
}> = ({shape}) => {
	const shapeComponent = shapeComponents.find(
		(c) => c.shape.toLowerCase() === shape.toLowerCase(),
	);

	if (!shapeComponent) {
		throw new Error('no');
	}

	return (
		<ul>
			<li>
				<a
					href={`/docs/shapes/${shapeComponent.shape.toLowerCase()}`}
				>{`<${shapeComponent.shape} />`}</a>
			</li>
			<li>
				<a href={`/docs/shapes`}>
					<code>@remotion/shapes</code>
				</a>
			</li>
			<li>
				<a
					href={`https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/utils/make-${shape.toLowerCase()}.ts`}
				>
					Source code for this function
				</a>
			</li>
		</ul>
	);
};

export const ShapeSeeAlso: React.FC<{
	readonly shape: string;
}> = ({shape}) => {
	const shapeComponent = shapeComponents.find(
		(c) => c.shape.toLowerCase() === shape.toLowerCase(),
	);

	if (!shapeComponent) {
		throw new Error('no');
	}

	return (
		<ul>
			<li>
				<a
					href={`/docs/shapes/${shapeComponent.shape.toLowerCase()}`}
				>{`make${shapeComponent.shape}()`}</a>
			</li>
			<li>
				<a href={`/docs/shapes`}>
					<code>@remotion/shapes</code>
				</a>
			</li>
			<li>
				<a
					href={`https://github.com/remotion-dev/remotion/blob/main/packages/shapes/src/components/${shape.toLowerCase()}.tsx`}
				>
					Source code for this function
				</a>
			</li>
		</ul>
	);
};
