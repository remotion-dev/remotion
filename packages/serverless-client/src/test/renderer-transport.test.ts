import {expect, test} from 'bun:test';
import {
	parseStorageRendererStatus,
	rendererTransportArtifactKey,
	type StorageRendererStatus,
	rendererTransportStatusKey,
} from '../renderer-transport';

const completedStatus: StorageRendererStatus = {
	schema: 1,
	state: 'completed',
	chunk: 2,
	attempt: 3,
	functionInvoked: true,
	renderedFrames: 20,
	encodedFrames: 20,
	uploadedFrames: 0,
	uploadedSizeInBytes: 0,
	startedAt: 100,
	completedAt: 200,
	videoKey: 'video',
	audioKey: null,
	artifacts: [],
};

test('renderer transport keys isolate chunks and attempts', () => {
	expect(
		rendererTransportStatusKey({renderId: 'render', chunk: 2, attempt: 3}),
	).toBe('renders/render/transport/chunks/2/attempt-3/status.json');
	expect(
		rendererTransportArtifactKey({renderId: 'render', chunk: 2, attempt: 3}, 4),
	).toBe('renders/render/transport/chunks/2/attempt-3/artifacts/4');
});

test('renderer status parser accepts only the requested protocol identity', () => {
	expect(
		parseStorageRendererStatus({
			value: completedStatus,
			expectedChunk: 2,
			expectedAttempt: 3,
		}),
	).toEqual(completedStatus);

	expect(() =>
		parseStorageRendererStatus({
			value: completedStatus,
			expectedChunk: 2,
			expectedAttempt: 2,
		}),
	).toThrow('expected chunk 2, attempt 2');
	expect(() =>
		parseStorageRendererStatus({
			value: {...completedStatus, schema: 2},
			expectedChunk: 2,
			expectedAttempt: 3,
		}),
	).toThrow('Unsupported renderer storage status schema');
});
