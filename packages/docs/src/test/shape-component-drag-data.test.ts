import {expect, test} from 'bun:test';
import {
	makeDefaultShapeComponentDragData,
	makeShapeComponentDragDataFromDemoState,
} from '../../components/shapes/shape-component-drag-data';
import {shapeNames} from '../../components/shapes/shapes-info';

test('embeds dimensions into default shape drag data', () => {
	for (const shape of shapeNames) {
		const dragData = makeDefaultShapeComponentDragData(shape);

		expect(dragData.component.dimensions).toBeDefined();
		expect(dragData.component.dimensions?.width).toBeGreaterThan(0);
		expect(dragData.component.dimensions?.height).toBeGreaterThan(0);
	}
});

test('embeds dimensions from shape demo state', () => {
	const dragData = makeShapeComponentDragDataFromDemoState({
		demoId: 'heart',
		state: {height: 200, aspectRatio: 1.2},
	});

	expect(dragData?.component.dimensions?.width).toBeCloseTo(240);
	expect(dragData?.component.dimensions?.height).toBe(200);
});
