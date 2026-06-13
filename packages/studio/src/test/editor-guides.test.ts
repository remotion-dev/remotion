import {expect, test} from 'bun:test';
import {BLUE, SELECTED_GUIDE, UNSELECTED_GUIDE} from '../helpers/colors';
import {
	getEditorGuideColor,
	getRulerGuideHighlight,
	isGuidePointerUpAClick,
	type GuidePointerDownPosition,
} from '../helpers/editor-guide-selection';
import type {Guide} from '../state/editor-guides';

const guideA: Guide = {
	compositionId: 'comp',
	id: 'guide-a',
	orientation: 'vertical',
	position: 100,
	show: true,
};

const guideB: Guide = {
	compositionId: 'comp',
	id: 'guide-b',
	orientation: 'horizontal',
	position: 200,
	show: true,
};

test('guide pointer-up only selects after a click on the same guide', () => {
	const pointerDownPosition: GuidePointerDownPosition = {
		guideId: 'guide-a',
		clientX: 120,
		clientY: 30,
	};

	expect(
		isGuidePointerUpAClick({
			pointerDownPosition: null,
			guideId: 'guide-a',
			clientX: 120,
			clientY: 30,
		}),
	).toBe(false);
	expect(
		isGuidePointerUpAClick({
			pointerDownPosition,
			guideId: 'guide-b',
			clientX: 120,
			clientY: 30,
		}),
	).toBe(false);
	expect(
		isGuidePointerUpAClick({
			pointerDownPosition,
			guideId: 'guide-a',
			clientX: 125,
			clientY: 30,
		}),
	).toBe(false);
	expect(
		isGuidePointerUpAClick({
			pointerDownPosition,
			guideId: 'guide-a',
			clientX: 122,
			clientY: 32,
		}),
	).toBe(true);
});

test('selected guides use blue while hovered or dragged guides keep the guide accent', () => {
	expect(getEditorGuideColor({selected: true, active: true})).toBe(BLUE);
	expect(getEditorGuideColor({selected: false, active: true})).toBe(
		SELECTED_GUIDE,
	);
	expect(getEditorGuideColor({selected: false, active: false})).toBe(
		UNSELECTED_GUIDE,
	);
});

test('ruler shows dragged guide numbers without requiring guide selection', () => {
	expect(
		getRulerGuideHighlight({
			guidesList: [guideA, guideB],
			selectedItems: [{type: 'sequence'}],
			hoveredGuideId: null,
			draggingGuideId: 'guide-a',
		}),
	).toEqual({
		guide: guideA,
		color: SELECTED_GUIDE,
	});
	expect(
		getRulerGuideHighlight({
			guidesList: [guideA, guideB],
			selectedItems: [{type: 'guide', guideId: 'guide-b'}],
			hoveredGuideId: null,
			draggingGuideId: 'guide-a',
		}),
	).toEqual({
		guide: guideB,
		color: BLUE,
	});
});
