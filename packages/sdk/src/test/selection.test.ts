import {expect, test} from 'bun:test';
import {
	createCanvasSelectionController,
	type CanvasSelectionItem,
	type SequenceNodePathInfo,
} from '../index';

const makeNodePathInfo = (
	id: string,
	auxiliaryKeys: string[] = [],
): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: {
		absolutePath: '/src/Composition.tsx',
		effectKeys: [],
		nodePath: ['sequence', id],
		sequenceKeys: [],
		videoConfigValues: null,
	},
	auxiliaryKeys,
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: true,
});

test('stores Studio-compatible heterogeneous multi-selection state', () => {
	const controller = createCanvasSelectionController();
	let updates = 0;
	const unsubscribe = controller.subscribe(() => {
		updates++;
	});
	const sequences: CanvasSelectionItem[] = ['intro', 'title', 'outro'].map(
		(id) => ({type: 'sequence', nodePathInfo: makeNodePathInfo(id)}),
	);
	const sequenceProperty: CanvasSelectionItem = {
		type: 'sequence-prop',
		nodePathInfo: makeNodePathInfo('intro', ['controls', 'style.opacity']),
		key: 'style.opacity',
	};
	const effectProperty: CanvasSelectionItem = {
		type: 'sequence-effect-prop',
		nodePathInfo: makeNodePathInfo('intro', ['effects', '0', 'radius']),
		i: 0,
		key: 'radius',
	};
	const keyframe: CanvasSelectionItem = {
		type: 'keyframe',
		nodePathInfo: makeNodePathInfo('intro', ['controls', 'style.opacity']),
		frame: 0,
	};
	const easing: CanvasSelectionItem = {
		type: 'easing',
		nodePathInfo: makeNodePathInfo('intro', ['controls', 'style.opacity']),
		fromFrame: 0,
		toFrame: 30,
		segmentIndex: 0,
	};

	controller.select(
		sequences[0],
		{shiftKey: false, toggleKey: false},
		sequences,
	);
	controller.select(
		sequences[2],
		{shiftKey: true, toggleKey: false},
		sequences,
	);
	expect(controller.getSnapshot()).toEqual({
		selectedItems: sequences,
		anchor: sequences[0],
	});
	controller.select(sequenceProperty, {shiftKey: false, toggleKey: false}, [
		sequenceProperty,
		effectProperty,
	]);
	controller.select(effectProperty, {shiftKey: false, toggleKey: true}, [
		sequenceProperty,
		effectProperty,
	]);

	expect(controller.getSnapshot()).toEqual({
		selectedItems: [sequenceProperty, effectProperty],
		anchor: effectProperty,
	});

	controller.setSelectedItems([keyframe, easing]);
	expect(controller.getSnapshot()).toEqual({
		selectedItems: [keyframe, easing],
		anchor: easing,
	});

	controller.clear();
	expect(controller.getSnapshot()).toEqual({
		selectedItems: [],
		anchor: null,
	});
	expect(updates).toBe(6);
	unsubscribe();
});
