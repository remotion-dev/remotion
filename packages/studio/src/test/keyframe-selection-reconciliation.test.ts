import {expect, test} from 'bun:test';
import type {SequenceNodePathInfo} from '@remotion/sdk';
import {
	reconcileKeyframeSelection,
	type KeyframeFieldState,
} from '../components/Timeline/reconcile-keyframe-selection';
import type {TimelineSelection} from '../components/Timeline/TimelineSelection';

const makeNodePathInfo = (fieldKey: string): SequenceNodePathInfo => ({
	sequenceSubscriptionKey: {
		absolutePath: '/project/src/Comp.tsx',
		nodePath: ['body', 0],
		sequenceKeys: ['from', 'durationInFrames'],
		effectKeys: [],
		videoConfigValues: null,
	},
	auxiliaryKeys: ['controls', fieldKey],
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
	supportsEffects: true,
});

const getFieldKey = (item: TimelineSelection) => {
	if (!('nodePathInfo' in item)) {
		return '';
	}

	return item.nodePathInfo.auxiliaryKeys.join('.');
};

const makeKeyframeSelection = (
	nodePathInfo: SequenceNodePathInfo,
	frame: number,
): TimelineSelection => ({type: 'keyframe', nodePathInfo, frame});

const makeEasingSelection = ({
	nodePathInfo,
	fromFrame,
	toFrame,
	segmentIndex,
}: {
	nodePathInfo: SequenceNodePathInfo;
	fromFrame: number;
	toFrame: number;
	segmentIndex: number;
}): TimelineSelection => ({
	type: 'easing',
	nodePathInfo,
	fromFrame,
	toFrame,
	segmentIndex,
});

const makeField = ({
	frames,
	values = frames,
	canEditEasing = true,
}: {
	frames: readonly number[];
	values?: readonly unknown[];
	canEditEasing?: boolean;
}): KeyframeFieldState => ({
	keyframes: frames.map((frame, index) => ({frame, value: values[index]})),
	easingSegments: frames.slice(1).map((frame, index) => ({
		fromFrame: frames[index],
		toFrame: frame,
		segmentIndex: index,
	})),
	canEditEasing,
});

const opacityField = makeNodePathInfo('opacity');
const movedField = (frames: readonly number[]) =>
	makeField({frames, values: [10, 20]});

test('Undoing a keyframe move moves the selection back to the restored frames', () => {
	const state = {
		selectedItems: [
			makeKeyframeSelection(opacityField, 27),
			makeKeyframeSelection(opacityField, 37),
		],
		anchor: makeKeyframeSelection(opacityField, 37),
	};
	const result = reconcileKeyframeSelection({
		previousFields: new Map([['controls.opacity', movedField([27, 37])]]),
		currentFields: new Map([['controls.opacity', movedField([30, 40])]]),
		getFieldKey,
		state,
	});

	expect(result).toEqual({
		selectedItems: [
			makeKeyframeSelection(opacityField, 30),
			makeKeyframeSelection(opacityField, 40),
		],
		anchor: makeKeyframeSelection(opacityField, 40),
	});
});

test('Redoing a keyframe move moves the selection to the recreated frames', () => {
	const result = reconcileKeyframeSelection({
		previousFields: new Map([['controls.opacity', movedField([30, 40])]]),
		currentFields: new Map([['controls.opacity', movedField([27, 37])]]),
		getFieldKey,
		state: {
			selectedItems: [makeKeyframeSelection(opacityField, 30)],
			anchor: makeKeyframeSelection(opacityField, 30),
		},
	});

	expect(result).toEqual({
		selectedItems: [makeKeyframeSelection(opacityField, 27)],
		anchor: makeKeyframeSelection(opacityField, 27),
	});
});

test('Undoing keyframe creation drops the selection', () => {
	const result = reconcileKeyframeSelection({
		previousFields: new Map([['controls.opacity', movedField([30, 40])]]),
		currentFields: new Map([['controls.opacity', makeField({frames: []})]]),
		getFieldKey,
		state: {
			selectedItems: [
				makeKeyframeSelection(opacityField, 30),
				makeKeyframeSelection(opacityField, 40),
			],
			anchor: makeKeyframeSelection(opacityField, 40),
		},
	});

	expect(result).toEqual({selectedItems: [], anchor: null});
});

test('Keyframes that still exist after the source change stay selected as-is', () => {
	const state = {
		selectedItems: [makeKeyframeSelection(opacityField, 27)],
		anchor: makeKeyframeSelection(opacityField, 27),
	};
	const result = reconcileKeyframeSelection({
		previousFields: new Map([['controls.opacity', movedField([30, 40])]]),
		currentFields: new Map([
			['controls.opacity', makeField({frames: [27, 40]})],
		]),
		getFieldKey,
		state,
	});

	expect(result).toBe(state);
});

test('An easing selection follows the restored segment', () => {
	const result = reconcileKeyframeSelection({
		previousFields: new Map([['controls.opacity', movedField([27, 37])]]),
		currentFields: new Map([['controls.opacity', movedField([30, 40])]]),
		getFieldKey,
		state: {
			selectedItems: [
				makeEasingSelection({
					nodePathInfo: opacityField,
					fromFrame: 27,
					toFrame: 37,
					segmentIndex: 0,
				}),
			],
			anchor: null,
		},
	});

	expect(result.selectedItems).toEqual([
		makeEasingSelection({
			nodePathInfo: opacityField,
			fromFrame: 30,
			toFrame: 40,
			segmentIndex: 0,
		}),
	]);
});

test('An easing selection is dropped when its segment no longer exists', () => {
	const result = reconcileKeyframeSelection({
		previousFields: new Map([['controls.opacity', movedField([27, 37])]]),
		currentFields: new Map([
			['controls.opacity', makeField({frames: [30, 40], canEditEasing: false})],
		]),
		getFieldKey,
		state: {
			selectedItems: [
				makeEasingSelection({
					nodePathInfo: opacityField,
					fromFrame: 27,
					toFrame: 37,
					segmentIndex: 0,
				}),
			],
			anchor: null,
		},
	});

	expect(result.selectedItems).toEqual([]);
});

test('Selections on fields without a resolved state are preserved', () => {
	const state = {
		selectedItems: [
			{type: 'sequence', nodePathInfo: opacityField},
			makeKeyframeSelection(opacityField, 30),
		],
		anchor: {type: 'sequence', nodePathInfo: opacityField},
	} satisfies {
		selectedItems: TimelineSelection[];
		anchor: TimelineSelection;
	};
	const result = reconcileKeyframeSelection({
		previousFields: new Map([['controls.opacity', movedField([30, 40])]]),
		currentFields: new Map(),
		getFieldKey,
		state,
	});

	expect(result).toBe(state);
});

test('Crossed keyframes are matched by value instead of position', () => {
	const field = (
		keyframes: readonly {frame: number; value: unknown}[],
	): KeyframeFieldState => ({
		keyframes,
		easingSegments: [],
		canEditEasing: false,
	});
	const result = reconcileKeyframeSelection({
		previousFields: new Map([
			[
				'controls.opacity',
				field([
					{frame: 40, value: 2},
					{frame: 45, value: 1},
				]),
			],
		]),
		currentFields: new Map([
			[
				'controls.opacity',
				field([
					{frame: 30, value: 1},
					{frame: 40, value: 2},
				]),
			],
		]),
		getFieldKey,
		state: {
			selectedItems: [makeKeyframeSelection(opacityField, 45)],
			anchor: makeKeyframeSelection(opacityField, 45),
		},
	});

	expect(result.selectedItems).toEqual([
		makeKeyframeSelection(opacityField, 30),
	]);
});

test('Overlapping restored keyframes are matched by value', () => {
	const result = reconcileKeyframeSelection({
		previousFields: new Map([
			['controls.opacity', makeField({frames: [20, 30], values: [0, 1]})],
		]),
		currentFields: new Map([
			['controls.opacity', makeField({frames: [30, 40], values: [0, 1]})],
		]),
		getFieldKey,
		state: {
			selectedItems: [
				makeKeyframeSelection(opacityField, 20),
				makeKeyframeSelection(opacityField, 30),
				makeEasingSelection({
					nodePathInfo: opacityField,
					fromFrame: 20,
					toFrame: 30,
					segmentIndex: 0,
				}),
			],
			anchor: makeKeyframeSelection(opacityField, 30),
		},
	});

	expect(result).toEqual({
		selectedItems: [
			makeKeyframeSelection(opacityField, 30),
			makeKeyframeSelection(opacityField, 40),
			makeEasingSelection({
				nodePathInfo: opacityField,
				fromFrame: 30,
				toFrame: 40,
				segmentIndex: 0,
			}),
		],
		anchor: makeKeyframeSelection(opacityField, 40),
	});
});

test('A value edited in place keeps the selected keyframe', () => {
	const result = reconcileKeyframeSelection({
		previousFields: new Map([
			['controls.opacity', makeField({frames: [30, 40], values: [0.2, 1]})],
		]),
		currentFields: new Map([
			['controls.opacity', makeField({frames: [30, 40], values: [0.5, 1]})],
		]),
		getFieldKey,
		state: {
			selectedItems: [makeKeyframeSelection(opacityField, 30)],
			anchor: makeKeyframeSelection(opacityField, 30),
		},
	});

	expect(result.selectedItems).toEqual([
		makeKeyframeSelection(opacityField, 30),
	]);
});

test('A newly selected keyframe is preserved', () => {
	const result = reconcileKeyframeSelection({
		previousFields: new Map([
			['controls.opacity', makeField({frames: [20], values: [0]})],
		]),
		currentFields: new Map([
			['controls.opacity', makeField({frames: [20, 30], values: [0, 1]})],
		]),
		getFieldKey,
		state: {
			selectedItems: [makeKeyframeSelection(opacityField, 30)],
			anchor: makeKeyframeSelection(opacityField, 30),
		},
	});

	expect(result.selectedItems).toEqual([
		makeKeyframeSelection(opacityField, 30),
	]);
});
