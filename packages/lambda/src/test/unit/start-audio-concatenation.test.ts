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

const makeStartPayload = () =>
	LambdaClientInternals.makeLambdaRenderMediaPayload(
		LambdaClientInternals.renderMediaOnLambdaOptionalToRequired({
			region: 'us-east-1',
			functionName: 'test-function',
			serveUrl: 'https://example.com',
			composition: 'test-composition',
			codec: 'h264',
			forceBucketName: 'test-bucket',
			logLevel: 'error',
		}),
	);

test('the start handler forwards audioConcatenation to the launch handler', async () => {
	const launchPayload = await startAndGetLaunchPayload({
		...(await makeStartPayload()),
		audioConcatenation: 'encode-at-merge',
	});

	expect(launchPayload.audioConcatenation).toBe('encode-at-merge');
});

test('the start handler passes audioConcatenation: "seamless-if-possible" when a client does not send it', async () => {
	const {audioConcatenation: _omitted, ...payloadWithoutMode} =
		await makeStartPayload();

	const launchPayload = await startAndGetLaunchPayload(
		payloadWithoutMode as ServerlessStartPayload,
	);

	expect(launchPayload.audioConcatenation).toBe('seamless-if-possible');
});
