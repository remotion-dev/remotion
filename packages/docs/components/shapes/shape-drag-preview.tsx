import {
	makeArrow,
	makeCallout,
	makeCircle,
	makeEllipse,
	makeHeart,
	makePie,
	makePolygon,
	makeRect,
	makeStar,
	makeTriangle,
} from '@remotion/shapes';
import type {ComponentDragData} from '@remotion/studio-shared';
import React from 'react';
import type {ShapeName} from './shapes-info';

type ShapeInfo = {
	readonly path: string;
	readonly width: number;
	readonly height: number;
	readonly fill: string;
};

const shapeNames: readonly ShapeName[] = [
	'Arrow',
	'Callout',
	'Circle',
	'Ellipse',
	'Heart',
	'Pie',
	'Polygon',
	'Rect',
	'Star',
	'Triangle',
];

const isShapeName = (value: string): value is ShapeName => {
	return shapeNames.includes(value as ShapeName);
};

const getProp = (
	props: Record<string, string | number | boolean>,
	name: string,
) => props[name];

const getNumber = (
	props: Record<string, string | number | boolean>,
	name: string,
) => {
	const value = getProp(props, name);
	if (typeof value !== 'number') {
		throw new Error(`Expected ${name} to be a number`);
	}

	return value;
};

const getBoolean = (
	props: Record<string, string | number | boolean>,
	name: string,
) => {
	const value = getProp(props, name);
	if (typeof value !== 'boolean') {
		throw new Error(`Expected ${name} to be a boolean`);
	}

	return value;
};

const getDirection = (
	props: Record<string, string | number | boolean>,
	name: string,
) => {
	const value = getProp(props, name);
	if (
		value !== 'left' &&
		value !== 'right' &&
		value !== 'up' &&
		value !== 'down'
	) {
		throw new Error(`Expected ${name} to be a direction`);
	}

	return value;
};

const withFill = (
	shapeInfo: Omit<ShapeInfo, 'fill'>,
	props: Record<string, string | number | boolean>,
): ShapeInfo => {
	const fill = getProp(props, 'fill');

	return {
		...shapeInfo,
		fill: typeof fill === 'string' ? fill : '#0b84ff',
	};
};

const makeShapeInfo = (dragData: ComponentDragData): ShapeInfo | null => {
	const shape = dragData.component.componentName;
	if (!isShapeName(shape)) {
		return null;
	}

	const props = Object.fromEntries(
		dragData.component.props.map((prop) => [prop.name, prop.value]),
	);

	switch (shape) {
		case 'Arrow':
			return withFill(
				makeArrow({
					length: getNumber(props, 'length'),
					headWidth: getNumber(props, 'headWidth'),
					headLength: getNumber(props, 'headLength'),
					shaftWidth: getNumber(props, 'shaftWidth'),
					direction: getDirection(props, 'direction'),
					cornerRadius:
						typeof props.cornerRadius === 'number' ? props.cornerRadius : 0,
				}),
				props,
			);
		case 'Callout':
			return withFill(
				makeCallout({
					width: getNumber(props, 'width'),
					height: getNumber(props, 'height'),
					pointerLength: getNumber(props, 'pointerLength'),
					pointerBaseWidth: getNumber(props, 'pointerBaseWidth'),
					pointerPosition: getNumber(props, 'pointerPosition'),
					pointerDirection: getDirection(props, 'pointerDirection'),
					cornerRadius: getNumber(props, 'cornerRadius'),
					edgeRoundness:
						typeof props.edgeRoundness === 'number'
							? props.edgeRoundness
							: null,
				}),
				props,
			);
		case 'Circle':
			return withFill(makeCircle({radius: getNumber(props, 'radius')}), props);
		case 'Ellipse':
			return withFill(
				makeEllipse({
					rx: getNumber(props, 'rx'),
					ry: getNumber(props, 'ry'),
				}),
				props,
			);
		case 'Heart':
			return withFill(
				makeHeart({
					height: getNumber(props, 'height'),
					aspectRatio: getNumber(props, 'aspectRatio'),
					bottomRoundnessAdjustment: getNumber(
						props,
						'bottomRoundnessAdjustment',
					),
					depthAdjustment: getNumber(props, 'depthAdjustment'),
				}),
				props,
			);
		case 'Pie':
			return withFill(
				makePie({
					radius: getNumber(props, 'radius'),
					progress: getNumber(props, 'progress'),
					closePath: getBoolean(props, 'closePath'),
					counterClockwise: getBoolean(props, 'counterClockwise'),
					rotation: getNumber(props, 'rotation'),
				}),
				props,
			);
		case 'Polygon':
			return withFill(
				makePolygon({
					points: getNumber(props, 'points'),
					radius: getNumber(props, 'radius'),
					cornerRadius: getNumber(props, 'cornerRadius'),
				}),
				props,
			);
		case 'Rect':
			return withFill(
				makeRect({
					width: getNumber(props, 'width'),
					height: getNumber(props, 'height'),
					cornerRadius: getNumber(props, 'cornerRadius'),
				}),
				props,
			);
		case 'Star':
			return withFill(
				makeStar({
					points: getNumber(props, 'points'),
					innerRadius: getNumber(props, 'innerRadius'),
					outerRadius: getNumber(props, 'outerRadius'),
					cornerRadius: getNumber(props, 'cornerRadius'),
				}),
				props,
			);
		case 'Triangle':
			return withFill(
				makeTriangle({
					length: getNumber(props, 'length'),
					direction: getDirection(props, 'direction'),
					cornerRadius: getNumber(props, 'cornerRadius'),
				}),
				props,
			);
		default:
			return null;
	}
};

export const ShapeDragPreview = React.forwardRef<
	SVGSVGElement,
	{
		readonly dragData: ComponentDragData;
		readonly size: number;
	}
>(({dragData, size}, ref) => {
	const shapeInfo = makeShapeInfo(dragData);
	if (shapeInfo === null) {
		return null;
	}

	const padding = Math.max(shapeInfo.width, shapeInfo.height) * 0.08;

	return (
		<svg
			ref={ref}
			width={size}
			height={size}
			viewBox={`${-padding} ${-padding} ${shapeInfo.width + padding * 2} ${
				shapeInfo.height + padding * 2
			}`}
			style={{display: 'block'}}
		>
			<path d={shapeInfo.path} fill={shapeInfo.fill} />
		</svg>
	);
});

ShapeDragPreview.displayName = 'ShapeDragPreview';
