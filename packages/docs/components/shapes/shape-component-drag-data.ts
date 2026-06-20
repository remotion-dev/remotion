import {
	COMPONENT_DRAG_MIME_TYPE,
	makeComponentDragData,
	type ComponentDragData,
	type ComponentProp,
} from '@remotion/studio-shared';
import {getShapeDragInfo} from './shape-drag-info';
import type {ShapeName} from './shapes-info';

const shapeDefaultProps: Record<ShapeName, readonly ComponentProp[]> = {
	Arrow: [
		{name: 'length', value: 300},
		{name: 'headWidth', value: 185},
		{name: 'headLength', value: 120},
		{name: 'shaftWidth', value: 80},
		{name: 'direction', value: 'right'},
		{name: 'fill', value: '#000000'},
	],
	Callout: [
		{name: 'width', value: 500},
		{name: 'height', value: 200},
		{name: 'pointerLength', value: 40},
		{name: 'pointerBaseWidth', value: 60},
		{name: 'pointerPosition', value: 0.5},
		{name: 'pointerDirection', value: 'down'},
		{name: 'cornerRadius', value: 20},
		{name: 'fill', value: '#000000'},
	],
	Circle: [
		{name: 'radius', value: 100},
		{name: 'fill', value: '#000000'},
	],
	Ellipse: [
		{name: 'rx', value: 100},
		{name: 'ry', value: 50},
		{name: 'fill', value: '#000000'},
	],
	Heart: [
		{name: 'height', value: 100},
		{name: 'aspectRatio', value: 1.1},
		{name: 'bottomRoundnessAdjustment', value: 0},
		{name: 'depthAdjustment', value: 0},
		{name: 'fill', value: '#000000'},
	],
	Pie: [
		{name: 'radius', value: 100},
		{name: 'progress', value: 0.75},
		{name: 'closePath', value: true},
		{name: 'counterClockwise', value: false},
		{name: 'rotation', value: 0},
		{name: 'fill', value: '#000000'},
	],
	Polygon: [
		{name: 'points', value: 5},
		{name: 'radius', value: 100},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#000000'},
	],
	Rect: [
		{name: 'width', value: 100},
		{name: 'height', value: 100},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#000000'},
	],
	Spark: [
		{name: 'width', value: 100},
		{name: 'height', value: 140},
		{name: 'edgeRoundness', value: 1},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#000000'},
	],
	Star: [
		{name: 'points', value: 5},
		{name: 'innerRadius', value: 50},
		{name: 'outerRadius', value: 100},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#000000'},
	],
	Triangle: [
		{name: 'length', value: 100},
		{name: 'direction', value: 'right'},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#000000'},
	],
};

const shapeNameByDemoId: Partial<Record<string, ShapeName>> = {
	arrow: 'Arrow',
	callout: 'Callout',
	circle: 'Circle',
	ellipse: 'Ellipse',
	heart: 'Heart',
	pie: 'Pie',
	polygon: 'Polygon',
	rect: 'Rect',
	spark: 'Spark',
	star: 'Star',
	triangle: 'Triangle',
};

const shapeDemoPropNames: Record<ShapeName, readonly string[]> = {
	Arrow: [
		'length',
		'headWidth',
		'headLength',
		'shaftWidth',
		'direction',
		'cornerRadius',
	],
	Callout: [
		'width',
		'height',
		'pointerLength',
		'pointerBaseWidth',
		'pointerPosition',
		'pointerDirection',
		'cornerRadius',
		'edgeRoundness',
	],
	Circle: ['radius'],
	Ellipse: ['rx', 'ry'],
	Heart: [
		'height',
		'aspectRatio',
		'bottomRoundnessAdjustment',
		'depthAdjustment',
	],
	Pie: ['radius', 'progress', 'closePath', 'counterClockwise', 'rotation'],
	Polygon: ['points', 'radius', 'cornerRadius', 'edgeRoundness'],
	Rect: ['width', 'height', 'cornerRadius', 'edgeRoundness'],
	Spark: ['width', 'height', 'edgeRoundness', 'cornerRadius'],
	Star: [
		'points',
		'innerRadius',
		'outerRadius',
		'cornerRadius',
		'edgeRoundness',
	],
	Triangle: ['length', 'direction', 'cornerRadius', 'edgeRoundness'],
};

const isComponentPropValue = (
	value: unknown,
): value is ComponentProp['value'] => {
	return (
		typeof value === 'string' ||
		typeof value === 'boolean' ||
		(typeof value === 'number' && Number.isFinite(value))
	);
};

const makeShapeComponentDragData = ({
	shape,
	props,
}: {
	readonly shape: ShapeName;
	readonly props: ComponentProp[];
}): ComponentDragData => {
	const component = {
		componentName: shape,
		importName: shape,
		importPath: '@remotion/shapes',
		props,
	} satisfies ComponentDragData['component'];
	const shapeInfo = getShapeDragInfo(component);

	return makeComponentDragData({
		...component,
		dimensions: shapeInfo
			? {width: shapeInfo.width, height: shapeInfo.height}
			: null,
	});
};

export const makeDefaultShapeComponentDragData = (
	shape: ShapeName,
): ComponentDragData => {
	return makeShapeComponentDragData({
		shape,
		props: [...shapeDefaultProps[shape]],
	});
};

export const getDefaultShapeComponentProps = (
	shape: ShapeName,
): ComponentProp[] => {
	return [...shapeDefaultProps[shape]];
};

export const makeShapeComponentDragDataFromDemoState = ({
	demoId,
	state,
}: {
	readonly demoId: string;
	readonly state: Record<string, unknown>;
}): ComponentDragData | null => {
	const shape = shapeNameByDemoId[demoId];
	if (!shape) {
		return null;
	}

	const defaultProps = shapeDefaultProps[shape];
	const defaultPropsByName = new Map(
		defaultProps.map((prop) => [prop.name, prop.value] as const),
	);
	const props: ComponentProp[] = [];
	const usedPropNames = new Set<string>();

	for (const name of shapeDemoPropNames[shape]) {
		const stateValue = state[name];
		const value =
			stateValue === null || typeof stateValue === 'undefined'
				? defaultPropsByName.get(name)
				: stateValue;

		if (isComponentPropValue(value)) {
			props.push({name, value});
			usedPropNames.add(name);
		}
	}

	for (const prop of defaultProps) {
		if (!usedPropNames.has(prop.name)) {
			props.push(prop);
		}
	}

	return makeShapeComponentDragData({shape, props});
};

export const setComponentDragData = ({
	dataTransfer,
	dragData,
	dragImage,
}: {
	readonly dataTransfer: DataTransfer;
	readonly dragData: ComponentDragData;
	readonly dragImage?: Element | null;
}) => {
	const serialized = JSON.stringify(dragData);
	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(COMPONENT_DRAG_MIME_TYPE, serialized);
	dataTransfer.setData('application/json', serialized);
	dataTransfer.setData('text/plain', serialized);

	if (dragImage) {
		const rect = dragImage.getBoundingClientRect();
		dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
	}
};
