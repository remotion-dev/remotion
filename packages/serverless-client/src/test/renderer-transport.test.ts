import {expect, test} from 'bun:test';
import {
	parseS3RendererStatus,
	rendererTransportArtifactKey,
	type S3RendererStatus,
	rendererTransportStatusKey,
} from '../renderer-transport';

const completedStatus: S3RendererStatus = {
	schema: 1,
	state: 'completed',
	chunk: 2,
	attempt: 3,
	lambdaInvoked: true,
	renderedFrames: 20,
	encodedFrames: 20,
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
		parseS3RendererStatus({
			value: completedStatus,
			expectedChunk: 2,
			expectedAttempt: 3,
		}),
	).toEqual(completedStatus);

	expect(() =>
		parseS3RendererStatus({
			value: completedStatus,
			expectedChunk: 2,
			expectedAttempt: 2,
		}),
	).toThrow('expected chunk 2, attempt 2');
	expect(() =>
		parseS3RendererStatus({
			value: {...completedStatus, schema: 2},
			expectedChunk: 2,
			expectedAttempt: 3,
		}),
	).toThrow('Unsupported renderer S3 status schema');
});
