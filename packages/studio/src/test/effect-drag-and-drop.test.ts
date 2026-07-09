import {expect, test} from 'bun:test';
import {
	ASSET_DRAG_MIME_TYPE,
	COMPOSITION_DRAG_MIME_TYPE,
	COMPONENT_DRAG_MIME_TYPE,
	EFFECT_DRAG_MIME_TYPE,
	ELEMENT_DRAG_MIME_TYPE,
	SFX_DRAG_MIME_TYPE,
	type EffectDragData,
	type RemotionDragMimeType,
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

const nonEffectRemotionDragMimeTypes = [
	['asset', ASSET_DRAG_MIME_TYPE],
	['component', COMPONENT_DRAG_MIME_TYPE],
	['composition', COMPOSITION_DRAG_MIME_TYPE],
	['element', ELEMENT_DRAG_MIME_TYPE],
	['sfx', SFX_DRAG_MIME_TYPE],
] satisfies readonly (readonly [string, RemotionDragMimeType])[];

for (const [label, mimeType] of nonEffectRemotionDragMimeTypes) {
	test(`does not treat ${label} imports as effect drags`, () => {
		expect(
			hasEffectDragType(
				makeDataTransfer({
					types: [mimeType, 'application/json', 'text/plain'],
				}),
			),
		).toBe(false);
	});
}

test('does not treat remote asset imports as effect drags', () => {
	expect(
		hasEffectDragType(
			makeDataTransfer({
				types: ['text/uri-list', 'text/plain'],
			}),
		),
	).toBe(false);
});
