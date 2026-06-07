import {
	makeShapeDragData,
	SHAPE_DRAG_MIME_TYPE,
	type ShapeAttribute,
	type ShapeDragData,
	type ShapeName,
} from '@remotion/studio-shared';

const shapeDefaultAttributes: Record<ShapeName, readonly ShapeAttribute[]> = {
	Arrow: [
		{name: 'length', value: 300},
		{name: 'headWidth', value: 185},
		{name: 'headLength', value: 120},
		{name: 'shaftWidth', value: 80},
		{name: 'direction', value: 'right'},
		{name: 'fill', value: '#0b84ff'},
	],
	Circle: [
		{name: 'radius', value: 100},
		{name: 'fill', value: '#0b84ff'},
	],
	Ellipse: [
		{name: 'rx', value: 100},
		{name: 'ry', value: 50},
		{name: 'fill', value: '#0b84ff'},
	],
	Heart: [
		{name: 'height', value: 100},
		{name: 'aspectRatio', value: 1.1},
		{name: 'bottomRoundnessAdjustment', value: 0},
		{name: 'depthAdjustment', value: 0},
		{name: 'fill', value: '#0b84ff'},
	],
	Pie: [
		{name: 'radius', value: 100},
		{name: 'progress', value: 0.75},
		{name: 'closePath', value: true},
		{name: 'counterClockwise', value: false},
		{name: 'rotation', value: 0},
		{name: 'fill', value: '#0b84ff'},
	],
	Polygon: [
		{name: 'points', value: 5},
		{name: 'radius', value: 100},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#0b84ff'},
	],
	Rect: [
		{name: 'width', value: 100},
		{name: 'height', value: 100},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#0b84ff'},
	],
	Star: [
		{name: 'points', value: 5},
		{name: 'innerRadius', value: 50},
		{name: 'outerRadius', value: 100},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#0b84ff'},
	],
	Triangle: [
		{name: 'length', value: 100},
		{name: 'direction', value: 'right'},
		{name: 'cornerRadius', value: 0},
		{name: 'fill', value: '#0b84ff'},
	],
};

export {type ShapeName};

export const makeDefaultShapeDragData = (shape: ShapeName): ShapeDragData => {
	return makeShapeDragData({
		attributes: [...shapeDefaultAttributes[shape]],
		shape,
	});
};

export const setShapeDragData = ({
	dataTransfer,
	dragData,
}: {
	readonly dataTransfer: DataTransfer;
	readonly dragData: ShapeDragData;
}) => {
	const serialized = JSON.stringify(dragData);
	dataTransfer.effectAllowed = 'copy';
	dataTransfer.setData(SHAPE_DRAG_MIME_TYPE, serialized);
	dataTransfer.setData('application/json', serialized);
	dataTransfer.setData('text/plain', serialized);
};
