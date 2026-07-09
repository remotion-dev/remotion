import {expect, test} from 'bun:test';
import {
	ASSET_DRAG_MIME_TYPE,
	EFFECT_DRAG_MIME_TYPE,
	ELEMENT_DRAG_MIME_TYPE,
	type EffectDragData,
} from '@remotion/studio-shared';
import {
	getEffectDragData,
	hasEffectDragType,
} from '../components/effect-drag-and-drop';

const effectDragData: EffectDragData = {
	type: 'remotion-effect',
	version: 1,
	effect: {
		name: 'Opacity',
		importPath: '@remotion/effects',
		config: {},
	},
};

const makeDataTransfer = ({
	types,
	data,
}: {
	readonly types: string[];
	readonly data?: Record<string, string>;
}): DataTransfer => {
	return {
		types,
		getData: (type: string) => data?.[type] ?? '',
	} as unknown as DataTransfer;
};

test('detects explicit effect drags', () => {
	expect(
		hasEffectDragType(
			makeDataTransfer({
				types: [EFFECT_DRAG_MIME_TYPE, 'application/json', 'text/plain'],
			}),
		),
	).toBe(true);
});

test('keeps generic effect drag fallback', () => {
	const serialized = JSON.stringify(effectDragData);
	const dataTransfer = makeDataTransfer({
		types: ['application/json', 'text/plain'],
		data: {
			'application/json': serialized,
			'text/plain': serialized,
		},
	});

	expect(hasEffectDragType(dataTransfer)).toBe(true);
	expect(getEffectDragData(dataTransfer)).toEqual(effectDragData);
});

test('does not treat asset imports as effect drags', () => {
	expect(
		hasEffectDragType(
			makeDataTransfer({
				types: [ASSET_DRAG_MIME_TYPE, 'application/json', 'text/plain'],
			}),
		),
	).toBe(false);
});

test('does not treat element imports as effect drags', () => {
	expect(
		hasEffectDragType(
			makeDataTransfer({
				types: [ELEMENT_DRAG_MIME_TYPE, 'application/json', 'text/plain'],
			}),
		),
	).toBe(false);
});

test('does not treat remote asset imports as effect drags', () => {
	expect(
		hasEffectDragType(
			makeDataTransfer({
				types: ['text/uri-list', 'text/plain'],
			}),
		),
	).toBe(false);
});
