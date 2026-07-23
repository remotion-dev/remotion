import {expect, test} from 'bun:test';
import {makeDragData, type MakeDragDataInput} from '@remotion/drag-and-drop';
import {
	getEffectDragData,
	hasEffectDragType,
} from '../components/effect-drag-and-drop';

const makeDataTransfer = (
	constructed: ReturnType<typeof makeDragData>,
): DataTransfer => {
	return {
		types: [constructed.mimeType],
		getData: (type: string) =>
			type === constructed.mimeType ? constructed.payload : '',
	} as unknown as DataTransfer;
};

test('detects and parses effect drags', () => {
	const effect = makeDragData({
		type: 'effect',
		name: 'Opacity',
		importPath: '@remotion/effects',
		config: {},
	});
	const dataTransfer = makeDataTransfer(effect);

	expect(hasEffectDragType(dataTransfer)).toBe(true);
	expect(getEffectDragData(dataTransfer)).toEqual(effect.data);
});

const nonEffectInputs: MakeDragDataInput[] = [
	{type: 'asset', assetPath: 'image.png'},
	{
		type: 'component',
		componentName: 'Circle',
		importName: 'Circle',
		importPath: '@remotion/shapes',
		props: [],
	},
	{
		type: 'composition',
		compositionFile: null,
		compositionId: 'Comp',
	},
	{
		type: 'element',
		dependencies: [],
		dimensions: null,
		displayName: 'Element',
		durationInFrames: 30,
		slug: 'element',
		sourceCode: 'export const Element = () => null;',
	},
	{type: 'sfx', name: 'SFX', url: 'https://remotion.media/sfx.wav'},
];

for (const input of nonEffectInputs) {
	test(`does not treat ${input.type} drags as effect drags`, () => {
		expect(hasEffectDragType(makeDataTransfer(makeDragData(input)))).toBe(
			false,
		);
	});
}

test('does not treat remote asset imports as effect drags', () => {
	expect(
		hasEffectDragType({
			types: ['text/uri-list', 'text/plain'],
		} as unknown as DataTransfer),
	).toBe(false);
});
