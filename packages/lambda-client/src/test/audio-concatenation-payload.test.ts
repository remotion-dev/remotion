import {expect, spyOn, test} from 'bun:test';
import {
	InvokeCommand,
	InvokeWithResponseStreamCommand,
	LambdaClient,
} from '@aws-sdk/client-lambda';
import type {AudioConcatenation} from '@remotion/renderer';
import {makeStreamPayloadMessage} from '@remotion/streaming';
import {makeLambdaRenderMediaPayload} from '../make-lambda-payload';
import {
	renderMediaOnLambda,
	renderMediaOnLambdaOptionalToRequired,
} from '../render-media-on-lambda';
import {renderMediaOnLambdaAndStream} from '../render-media-on-lambda-and-stream';
import type {ServerlessStartPayload} from '../shared-constants';

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

test('Lambda media and streaming APIs send audioConcatenation', async () => {
	const previousSkipCredentialsCheck =
		process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK;
	process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK = 'true';
	const payloads: ServerlessStartPayload[] = [];
	const render = {renderId: 'test-render', bucketName: 'test-bucket'};
	const send = spyOn(LambdaClient.prototype, 'send').mockImplementation(
		(command) => {
			if (
				!(
					command instanceof InvokeCommand ||
					command instanceof InvokeWithResponseStreamCommand
				)
			) {
				throw new Error('Unexpected AWS command');
			}

			const payload = JSON.parse(
				String(command.input.Payload),
			) as ServerlessStartPayload;
			payloads.push(payload);
			if (command instanceof InvokeCommand) {
				return Promise.resolve({
					Payload: new TextEncoder().encode(JSON.stringify(render)),
				});
			}

			const progress = {
				done: true,
				fatalErrorEncountered: false,
				timeoutTimestamp: Date.now() + 120000,
				outBucket: render.bucketName,
				outKey: 'out.mp4',
				outputFile: 'https://example.com/out.mp4',
				outputSequence: null,
			};
			return Promise.resolve({
				EventStream: (async function* () {
					for (const [nonce, data] of [
						['b', render],
						['d', progress],
					] as const) {
						yield {
							PayloadChunk: {
								Payload: makeStreamPayloadMessage({
									status: 0,
									nonce,
									body: new TextEncoder().encode(JSON.stringify(data)),
								}),
							},
						};
					}
				})(),
			});
		},
	);
	try {
		const options = {
			region: 'us-east-1' as const,
			functionName: 'test-function',
			serveUrl: 'https://example.com',
			composition: 'test-composition',
			audioConcatenation: 'encode-at-merge' as const,
		};
		expect(
			await renderMediaOnLambda({...options, codec: 'h264'}),
		).toMatchObject(render);
		expect(
			await renderMediaOnLambdaAndStream({...options, codec: 'h264'}),
		).toMatchObject({done: true, outKey: 'out.mp4'});

		expect(payloads).toHaveLength(2);
		for (const payload of payloads) {
			expect(payload.audioConcatenation).toBe('encode-at-merge');
		}

		expect(payloads.map((payload) => payload.streamProgress)).toEqual([
			false,
			true,
		]);
	} finally {
		send.mockRestore();
		if (previousSkipCredentialsCheck === undefined) {
			delete process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK;
		} else {
			process.env.REMOTION_SKIP_AWS_CREDENTIALS_CHECK =
				previousSkipCredentialsCheck;
		}
	}
});

test('renderMediaOnLambda() sends audioConcatenation: "seamless-if-possible" by default', async () => {
	const payload = await makePayload(undefined);

	expect(payload.audioConcatenation).toBe('seamless-if-possible');
});
