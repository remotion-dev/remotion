import {expect, test} from 'bun:test';
import type {AudioConcatenation} from '@remotion/renderer';
import {makeLambdaRenderMediaPayload} from '../make-lambda-payload';
import {renderMediaOnLambdaOptionalToRequired} from '../render-media-on-lambda';

const makePayload = (audioConcatenation: AudioConcatenation | undefined) =>
	makeLambdaRenderMediaPayload(
		renderMediaOnLambdaOptionalToRequired({
			region: 'us-east-1',
			functionName: 'test-function',
			serveUrl: 'https://example.com',
			composition: 'test-composition',
			codec: 'h264',
			audioConcatenation,
		}),
	);

test('renderMediaOnLambda() sends audioConcatenation in the start payload', async () => {
	const payload = await makePayload('encode-at-merge');

	expect(payload.audioConcatenation).toBe('encode-at-merge');
});

test('renderMediaOnLambda() sends audioConcatenation: "seamless-if-possible" by default', async () => {
	const payload = await makePayload(undefined);

	expect(payload.audioConcatenation).toBe('seamless-if-possible');
});
