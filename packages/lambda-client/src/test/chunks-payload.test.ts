import {expect, test} from 'bun:test';
import {makeLambdaRenderMediaPayload} from '../make-lambda-payload';
import {renderMediaOnLambdaOptionalToRequired} from '../render-media-on-lambda';

const makePayload = (chunks: [number, number][] | undefined) =>
	makeLambdaRenderMediaPayload(
		renderMediaOnLambdaOptionalToRequired({
			region: 'us-east-1',
			functionName: 'test-function',
			serveUrl: 'https://example.com',
			composition: 'test-composition',
			codec: 'h264',
			chunks,
		}),
	);

test('renderMediaOnLambda() sends chunks in the start payload', async () => {
	const chunks: [number, number][] = [
		[0, 59],
		[60, 89],
		[90, 374],
	];

	const payload = await makePayload(chunks);

	expect(JSON.parse(JSON.stringify(payload)).chunks).toEqual(chunks);
	expect(payload.framesPerLambda).toBe(null);
	expect(payload.concurrency).toBe(null);
});

test('renderMediaOnLambda() sends chunks: null when no chunks are passed', async () => {
	const payload = await makePayload(undefined);

	expect(payload.chunks).toBe(null);
});
