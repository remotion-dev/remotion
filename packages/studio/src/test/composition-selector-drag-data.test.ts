import {expect, test} from 'bun:test';
import {
	compositionSelectorDragDataToSymbolicatedStack,
	hasCompositionSelectorDragData,
	makeCompositionSelectorDragData,
	parseCompositionSelectorDragData,
} from '../components/composition-selector-drag-data';

const composition = makeCompositionSelectorDragData({
	item: {type: 'composition', compositionId: 'MyVideo'},
	sourceFile: 'src/Root.tsx',
});

const folder = makeCompositionSelectorDragData({
	item: {type: 'folder', folderName: 'Nested', parentName: 'Parent'},
	sourceFile: null,
});

const makeDataTransfer = ({
	mimeType,
	payload,
}: {
	readonly mimeType: string;
	readonly payload: string;
}) => ({
	types: ['text/plain', mimeType],
	getData: (requestedMimeType: string) =>
		requestedMimeType === mimeType ? payload : '',
});

test('constructs and parses composition selector drag data', () => {
	expect(composition.mimeType).toBe(
		'application/remotion-composition-selector-reorder',
	);
	expect(hasCompositionSelectorDragData(['text/plain'])).toBe(false);
	expect(
		hasCompositionSelectorDragData(['text/plain', composition.mimeType]),
	).toBe(true);
	expect(
		parseCompositionSelectorDragData(makeDataTransfer(composition)),
	).toEqual(composition.data);
	expect(parseCompositionSelectorDragData(makeDataTransfer(folder))).toEqual(
		folder.data,
	);
});

test('rejects malformed composition selector drag data', () => {
	expect(
		parseCompositionSelectorDragData({
			types: ['text/plain'],
			getData: () => composition.payload,
		}),
	).toBe(null);

	const validComposition = {
		type: 'remotion-composition-selector',
		version: 1,
		item: {type: 'composition', compositionId: 'MyVideo'},
		sourceFile: 'src/Root.tsx',
	};
	const validFolder = {
		...validComposition,
		item: {type: 'folder', folderName: 'Nested', parentName: 'Parent'},
	};

	for (const payload of [
		'',
		'{',
		JSON.stringify({...validComposition, type: 'other'}),
		JSON.stringify({...validComposition, version: 2}),
		JSON.stringify({...validComposition, item: null}),
		JSON.stringify({
			...validComposition,
			item: {type: 'other', compositionId: 'MyVideo'},
		}),
		JSON.stringify({
			...validComposition,
			item: {type: 'composition', compositionId: ''},
		}),
		JSON.stringify({
			...validComposition,
			item: {type: 'composition', compositionId: 'a'.repeat(501)},
		}),
		JSON.stringify({
			...validComposition,
			item: {type: 'composition', compositionId: 'Invalid\0id'},
		}),
		JSON.stringify({
			...validFolder,
			item: {...validFolder.item, folderName: ''},
		}),
		JSON.stringify({
			...validFolder,
			item: {...validFolder.item, folderName: 'a'.repeat(501)},
		}),
		JSON.stringify({
			...validFolder,
			item: {...validFolder.item, parentName: 'a'.repeat(2001)},
		}),
		JSON.stringify({
			...validFolder,
			item: {type: 'folder', folderName: 'Nested'},
		}),
		JSON.stringify({...validComposition, sourceFile: undefined}),
		JSON.stringify({...validComposition, sourceFile: ''}),
		JSON.stringify({...validComposition, sourceFile: 'a'.repeat(2001)}),
		JSON.stringify({...validComposition, sourceFile: '/src/Root.tsx'}),
		JSON.stringify({...validComposition, sourceFile: '../Root.tsx'}),
		JSON.stringify({...validComposition, sourceFile: 'src/../Root.tsx'}),
		JSON.stringify({...validComposition, sourceFile: 'src\\Root.tsx'}),
		JSON.stringify({...validComposition, sourceFile: 'src/Root\0.tsx'}),
	]) {
		expect(
			parseCompositionSelectorDragData(
				makeDataTransfer({mimeType: composition.mimeType, payload}),
			),
		).toBe(null);
	}
});

test('converts composition selector source locations to symbolicated stacks', () => {
	expect(
		compositionSelectorDragDataToSymbolicatedStack(composition.data),
	).toEqual({
		originalColumnNumber: null,
		originalFileName: 'src/Root.tsx',
		originalFunctionName: null,
		originalLineNumber: null,
		originalScriptCode: null,
	});
	expect(compositionSelectorDragDataToSymbolicatedStack(folder.data)).toBe(
		null,
	);
});
