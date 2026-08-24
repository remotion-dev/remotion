import {expect, test} from 'bun:test';
import {createCanvasController, type CanvasSelectionItem} from '../index';

test('stores a heterogeneous multi-selection through the public controller', () => {
	const controller = createCanvasController();
	let updates = 0;
	const unsubscribe = controller.selection.subscribe(() => {
		updates++;
	});
	const sequence: CanvasSelectionItem = {
		type: 'entity',
		entity: {type: 'sequence', id: 'intro'},
	};
	const effectProperty: CanvasSelectionItem = {
		type: 'property',
		entity: {type: 'effect', id: 'blur', sequenceId: 'intro'},
		propertyPath: ['radius'],
	};
	const easing: CanvasSelectionItem = {
		type: 'easing',
		entity: {type: 'sequence', id: 'intro'},
		propertyPath: ['style', 'opacity'],
		fromFrame: 0,
		toFrame: 30,
		segmentIndex: 0,
	};

	controller.selection.select(sequence, 'replace');
	controller.selection.select(effectProperty, 'add');
	controller.selection.select(easing, 'add');

	expect(controller.selection.getSnapshot()).toEqual({
		selectedItems: [sequence, effectProperty, easing],
		anchor: easing,
	});

	controller.selection.select(effectProperty, 'toggle');
	expect(controller.selection.getSnapshot()).toEqual({
		selectedItems: [sequence, easing],
		anchor: easing,
	});

	controller.selection.setSelectedItems([sequence, sequence, effectProperty]);
	expect(controller.selection.getSnapshot()).toEqual({
		selectedItems: [sequence, effectProperty],
		anchor: effectProperty,
	});

	controller.selection.clear();
	expect(controller.selection.getSnapshot()).toEqual({
		selectedItems: [],
		anchor: null,
	});
	expect(updates).toBe(6);
	unsubscribe();
});
