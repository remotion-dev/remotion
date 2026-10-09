import {expect, test} from 'bun:test';
import type {
	InteractivitySchema,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {
	applyCanvasOutlineDragAxisLock,
	canvasOutlineDragThresholdPx,
	getCanvasOutlineNudgeDelta,
	getCanvasOutlineNudgeDeltas,
	getCanvasOutlineTranslateDragChanges,
	getCanvasOutlineTranslateDragValues,
	isCanvasOutlineDragPastThreshold,
	type CanvasOutlineTranslateDragState,
} from '../outline-translate-drag';

const makeKey = (nodePath: SequenceNodePath): SequencePropsSubscriptionKey => ({
	absolutePath: '/project/src/Comp.tsx',
	nodePath,
	sequenceKeys: ['from', 'durationInFrames'],
	effectKeys: [],
	videoConfigValues: null,
});

test('outline dragging applies the same delta to all selected sequences', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
	} satisfies InteractivitySchema;
	const firstNodePath = makeKey(['body', 0]);
	const secondNodePath = makeKey(['body', 1]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(firstNodePath),
			sourceFrame: 12,
			startX: 10,
			startY: 20,
			startZ: 30,
			target: {
				propStatus: {
					status: 'static',
					keyframeDisplayOffsetAdjustment: null,
					codeValue: '10px 20px 30px',
				},
				fieldDefault: '0px 0px',
				runtimeValue: undefined,
				keyframeDisplayOffset: 30,
				keyframePlaybackRate: 1,
				nodePath: firstNodePath,
				schema,
			},
		},
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(secondNodePath),
			sourceFrame: 12,
			startX: -5,
			startY: 3,
			startZ: null,
			target: {
				propStatus: {
					status: 'static',
					keyframeDisplayOffsetAdjustment: null,
					codeValue: '-5px 3px',
				},
				fieldDefault: '0px 0px',
				runtimeValue: undefined,
				keyframeDisplayOffset: 30,
				keyframePlaybackRate: 1,
				nodePath: secondNodePath,
				schema,
			},
		},
	] satisfies CanvasOutlineTranslateDragState[];

	const lastValues = getCanvasOutlineTranslateDragValues({
		dragStates,
		deltaX: 7.333333,
		deltaY: -4.666667,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('17.3px 15.3px 30px');
	expect(lastValues.get(dragStates[1].key)).toBe('2.3px -1.7px');
	expect(
		getCanvasOutlineTranslateDragChanges({
			dragStates,
			lastValues,
		}),
	).toEqual([
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath: firstNodePath,
			fieldKey: 'style.translate',
			value: '17.3px 15.3px 30px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath: secondNodePath,
			fieldKey: 'style.translate',
			value: '2.3px -1.7px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
	]);
});

test('outline dragging can lock movement to the dominant axis', () => {
	expect(
		applyCanvasOutlineDragAxisLock({
			deltaX: 12,
			deltaY: 7,
			axisLocked: true,
		}),
	).toEqual({deltaX: 12, deltaY: 0});
	expect(
		applyCanvasOutlineDragAxisLock({
			deltaX: 12,
			deltaY: 13,
			axisLocked: true,
		}),
	).toEqual({deltaX: 0, deltaY: 13});
	expect(
		applyCanvasOutlineDragAxisLock({
			deltaX: 12,
			deltaY: 13,
			axisLocked: false,
		}),
	).toEqual({deltaX: 12, deltaY: 13});
});

test('outline keyboard nudging moves by one or ten pixels', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 12,
			startX: 10,
			startY: 20,
			startZ: null,
			target: {
				propStatus: {
					status: 'static',
					keyframeDisplayOffsetAdjustment: null,
					codeValue: '10px 20px',
				},
				fieldDefault: '0px 0px',
				runtimeValue: undefined,
				keyframeDisplayOffset: 30,
				keyframePlaybackRate: 1,
				nodePath,
				schema,
			},
		},
	] satisfies CanvasOutlineTranslateDragState[];

	expect(
		getCanvasOutlineNudgeDelta({
			direction: 'left',
			shiftKey: false,
		}),
	).toBe(-1);
	expect(
		getCanvasOutlineNudgeDelta({
			direction: 'right',
			shiftKey: true,
		}),
	).toBe(10);
	expect(
		getCanvasOutlineNudgeDelta({
			direction: 'up',
			shiftKey: false,
		}),
	).toBe(-1);
	expect(
		getCanvasOutlineNudgeDelta({
			direction: 'down',
			shiftKey: true,
		}),
	).toBe(10);
	const accumulatedDeltas = [
		{direction: 'right', shiftKey: false},
		{direction: 'right', shiftKey: false},
		{direction: 'down', shiftKey: true},
	] satisfies readonly {
		readonly direction: 'left' | 'right' | 'up' | 'down';
		readonly shiftKey: boolean;
	}[];
	const finalDeltas = accumulatedDeltas.reduce(
		(deltas, keyPress) =>
			getCanvasOutlineNudgeDeltas({
				...deltas,
				direction: keyPress.direction,
				shiftKey: keyPress.shiftKey,
			}),
		{deltaX: 0, deltaY: 0},
	);

	expect(finalDeltas).toEqual({deltaX: 2, deltaY: 10});

	const horizontalLastValues = getCanvasOutlineTranslateDragValues({
		dragStates,
		deltaX: getCanvasOutlineNudgeDelta({
			direction: 'right',
			shiftKey: true,
		}),
		deltaY: 0,
	});

	expect(horizontalLastValues.get(dragStates[0].key)).toBe('20px 20px');
	expect(
		getCanvasOutlineTranslateDragChanges({
			dragStates,
			lastValues: horizontalLastValues,
		}),
	).toEqual([
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.translate',
			value: '20px 20px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
	]);

	const verticalLastValues = getCanvasOutlineTranslateDragValues({
		dragStates,
		deltaX: 0,
		deltaY: getCanvasOutlineNudgeDelta({
			direction: 'down',
			shiftKey: true,
		}),
	});

	expect(verticalLastValues.get(dragStates[0].key)).toBe('10px 30px');
	expect(
		getCanvasOutlineTranslateDragChanges({
			dragStates,
			lastValues: verticalLastValues,
		}),
	).toEqual([
		{
			type: 'static',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.translate',
			value: '10px 30px',
			defaultValue: JSON.stringify('0px 0px'),
			schema,
		},
	]);
});

test('outline dragging starts after a screen pixel threshold', () => {
	expect(
		isCanvasOutlineDragPastThreshold({
			deltaX: canvasOutlineDragThresholdPx - 0.1,
			deltaY: 0,
		}),
	).toBe(false);
	expect(
		isCanvasOutlineDragPastThreshold({
			deltaX: canvasOutlineDragThresholdPx,
			deltaY: 0,
		}),
	).toBe(true);
	expect(
		isCanvasOutlineDragPastThreshold({
			deltaX: 3,
			deltaY: 3,
		}),
	).toBe(true);
});

test('outline dragging keyframed translate adds a keyframe at the source frame', () => {
	const schema = {
		'style.translate': {type: 'translate', default: '0px 0px'},
	} satisfies InteractivitySchema;
	const nodePath = makeKey(['body', 0]);
	const dragStates = [
		{
			defaultValue: JSON.stringify('0px 0px'),
			key: Internals.makeSequencePropsSubscriptionKey(nodePath),
			sourceFrame: 20,
			startX: 50,
			startY: 25,
			startZ: 15,
			target: {
				propStatus: {
					status: 'keyframed',
					keyframeDisplayOffsetAdjustment: null,
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: '0px 0px 15px'},
						{frame: 40, value: '100px 50px 15px'},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
					posterize: undefined,
					output: undefined,
				},
				fieldDefault: '0px 0px',
				runtimeValue: undefined,
				keyframeDisplayOffset: 30,
				keyframePlaybackRate: 1,
				nodePath,
				schema,
			},
		},
	] satisfies CanvasOutlineTranslateDragState[];

	const lastValues = getCanvasOutlineTranslateDragValues({
		dragStates,
		deltaX: 7,
		deltaY: -4,
	});

	expect(lastValues.get(dragStates[0].key)).toBe('57px 21px 15px');
	expect(
		getCanvasOutlineTranslateDragChanges({
			dragStates,
			lastValues,
		}),
	).toEqual([
		{
			type: 'keyframed',
			fileName: '/project/src/Comp.tsx',
			nodePath,
			fieldKey: 'style.translate',
			sourceFrame: 20,
			value: '57px 21px 15px',
			schema,
		},
	]);
	expect(
		getCanvasOutlineTranslateDragChanges({
			dragStates,
			lastValues: new Map([[dragStates[0].key, '50px 25px 15px']]),
		}),
	).toEqual([]);
});
