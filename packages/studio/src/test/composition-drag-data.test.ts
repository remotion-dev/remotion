import {expect, test} from 'bun:test';
import {
	compositionDragDataToSymbolicatedStack,
	getCompositionDragPreviewMetadata,
	makeCompositionDragData,
	parseCompositionDragData,
} from '../components/composition-drag-data';
import {
	getCompositionDragData,
	isCompositionDragEvent,
} from '../components/drop-handler-data';

const constructed = makeCompositionDragData({
	compositionFile: 'src/Root.tsx',
	compositionId: 'MyVideo',
	width: 1920,
	height: 1080,
	durationInFrames: 150,
});

const makeDataTransfer = ({
	mimeType,
	payload,
}: {
	mimeType: string;
	payload: string;
}) => ({
	types: ['text/plain', mimeType],
	getData: (requestedMimeType: string) =>
		requestedMimeType === mimeType ? payload : '',
});

test('constructs and parses Studio composition drag data', () => {
	expect(constructed.mimeType).toBe(
		'application/vnd.remotion.drag+json;v=1;type=composition;width=1920;height=1080;duration=150',
	);
	expect(getCompositionDragPreviewMetadata(['text/plain'])).toBe(null);
	expect(
		getCompositionDragPreviewMetadata(['text/plain', constructed.mimeType]),
	).toEqual({
		type: 'composition',
		mimeType: constructed.mimeType,
		width: 1920,
		height: 1080,
		durationInFrames: 150,
	});
	expect(parseCompositionDragData(makeDataTransfer(constructed))).toEqual({
		type: 'remotion-composition',
		version: 1,
		compositionFile: 'src/Root.tsx',
		compositionId: 'MyVideo',
	});

	const dragEvent = {
		dataTransfer: makeDataTransfer(constructed),
	} as unknown as DragEvent;
	expect(isCompositionDragEvent(dragEvent)).toBe(true);
	expect(getCompositionDragData(dragEvent)).toEqual(constructed.data);
});

test('preserves unresolved composition metadata', () => {
	const unresolved = makeCompositionDragData({
		compositionFile: null,
		compositionId: 'UnresolvedVideo',
		width: null,
		height: null,
		durationInFrames: null,
	});

	expect(unresolved.mimeType).toBe(
		'application/vnd.remotion.drag+json;v=1;type=composition',
	);
	expect(getCompositionDragPreviewMetadata([unresolved.mimeType])).toEqual({
		type: 'composition',
		mimeType: unresolved.mimeType,
		width: null,
		height: null,
		durationInFrames: null,
	});
	expect(parseCompositionDragData(unresolved)?.compositionFile).toBe(null);
});

test('rejects malformed composition drag data', () => {
	const malformedMimeTypes = [
		'application/vnd.remotion.drag+json;v=1;type=composition;width=1920',
		'application/vnd.remotion.drag+json;v=1;type=composition;type=composition',
		'application/vnd.remotion.drag+json;v=1;type=composition;unknown=value',
		'application/vnd.remotion.drag+json;v=1;type=composition;duration=1.5',
		`${'application/vnd.remotion.drag+json;v=1;type=composition;'}${'x'.repeat(512)}`,
	];
	for (const mimeType of malformedMimeTypes) {
		expect(getCompositionDragPreviewMetadata([mimeType])).toBe(null);
	}

	for (const payload of [
		'',
		'{',
		JSON.stringify({
			type: 'remotion-composition',
			version: 1,
			compositionFile: '/tmp/Root.tsx',
			compositionId: 'MyVideo',
		}),
		JSON.stringify({
			type: 'remotion-composition',
			version: 1,
			compositionFile: '../Root.tsx',
			compositionId: 'MyVideo',
		}),
		JSON.stringify({
			type: 'remotion-composition',
			version: 1,
			compositionFile: 'src/Root.tsx',
			compositionId: 'Invalid id',
		}),
	]) {
		expect(
			parseCompositionDragData({
				mimeType: constructed.mimeType,
				payload,
			}),
		).toBe(null);
	}
});

test('converts composition source locations to symbolicated stacks', () => {
	expect(compositionDragDataToSymbolicatedStack(constructed.data)).toEqual({
		originalColumnNumber: null,
		originalFileName: 'src/Root.tsx',
		originalFunctionName: null,
		originalLineNumber: null,
		originalScriptCode: null,
	});
	expect(
		compositionDragDataToSymbolicatedStack(
			makeCompositionDragData({
				compositionFile: null,
				compositionId: 'MyVideo',
				width: null,
				height: null,
				durationInFrames: null,
			}).data,
		),
	).toBe(null);
});
