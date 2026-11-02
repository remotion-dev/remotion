import {expect, test} from 'bun:test';
import {
	LambdaClientInternals,
	ServerlessRoutines,
	type ServerlessPayload,
	type ServerlessStartPayload,
} from '@remotion/lambda-client';
import {startHandler} from '../../functions/handlers/start';
import {fakeAws, useFakeAws} from '../mocks/fake-aws';

useFakeAws();

const startAndGetLaunchPayload = async (payload: ServerlessStartPayload) => {
	const launchedPayloads: ServerlessPayload[] = [];
	fakeAws().callFunctionAsync.mockImplementation(({payload: launched}) => {
		launchedPayloads.push(launched);
		return Promise.resolve();
	});

	await startHandler({
		params: payload,
		options: {
			expectedBucketOwner: '123456789012',
			timeoutInMilliseconds: 120_000,
			renderId: 'test-render',
		},
	});

	const [launchPayload] = launchedPayloads;
	if (launchPayload?.type !== ServerlessRoutines.launch) {
		throw new Error('Expected a launch payload');
	}

	return launchPayload;
};

const makeStartPayload = (chunks: [number, number][] | undefined) =>
	LambdaClientInternals.makeLambdaRenderMediaPayload(
		LambdaClientInternals.renderMediaOnLambdaOptionalToRequired({
			region: 'us-east-1',
			functionName: 'test-function',
			serveUrl: 'https://example.com',
			composition: 'test-composition',
			codec: 'h264',
			forceBucketName: 'test-bucket',
			logLevel: 'error',
			chunks,
		}),
	);

test('the start handler forwards chunks from renderMediaOnLambda() to the launch handler', async () => {
	const chunks: [number, number][] = [
		[0, 59],
		[60, 89],
		[90, 374],
	];

	const launchPayload = await startAndGetLaunchPayload(
		await makeStartPayload(chunks),
	);

	expect(launchPayload.chunks).toEqual(chunks);
	expect(launchPayload.framesPerFunction).toBe(null);
	expect(launchPayload.concurrency).toBe(null);
});

test('the start handler passes chunks: null when a client does not send chunks', async () => {
	const {chunks: _omitted, ...payloadWithoutChunks} =
		await makeStartPayload(undefined);

	const launchPayload = await startAndGetLaunchPayload(
		payloadWithoutChunks as ServerlessStartPayload,
	);

	expect(launchPayload.chunks).toBe(null);
});
