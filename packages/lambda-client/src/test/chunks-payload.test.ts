import {expect, spyOn, test} from 'bun:test';
import {
	InvokeCommand,
	InvokeWithResponseStreamCommand,
	LambdaClient,
} from '@aws-sdk/client-lambda';
import {makeStreamPayloadMessage} from '@remotion/streaming';
import {makeLambdaRenderMediaPayload} from '../make-lambda-payload';
import {renderFramesOnLambda} from '../render-frames-on-lambda';
import {renderFramesOnLambdaAndStream} from '../render-frames-on-lambda-and-stream';
import {
	renderMediaOnLambda,
	renderMediaOnLambdaOptionalToRequired,
} from '../render-media-on-lambda';
import {renderMediaOnLambdaAndStream} from '../render-media-on-lambda-and-stream';
import type {ServerlessStartPayload} from '../shared-constants';

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

test('Lambda media, image sequence, and streaming APIs send explicit chunks', async () => {
	const chunks: [number, number][] = [
		[0, 59],
		[60, 89],
		[90, 374],
	];
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
				outKey: payload.output.type === 'media' ? 'out.mp4' : null,
				outputFile:
					payload.output.type === 'media'
						? 'https://example.com/out.mp4'
						: null,
				outputSequence:
					payload.output.type === 'sequence'
						? {manifestUrl: 'https://example.com/manifest.json'}
						: null,
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
			chunks,
		};
		expect(
			await renderMediaOnLambda({...options, codec: 'h264'}),
		).toMatchObject(render);
		expect(await renderFramesOnLambda(options)).toMatchObject(render);
		expect(
			await renderMediaOnLambdaAndStream({...options, codec: 'h264'}),
		).toMatchObject({done: true, outKey: 'out.mp4'});
		expect(await renderFramesOnLambdaAndStream(options)).toMatchObject({
			done: true,
			outputSequence: {manifestUrl: 'https://example.com/manifest.json'},
		});

		expect(payloads).toHaveLength(4);
		for (const payload of payloads) {
			expect(payload.chunks).toEqual(chunks);
			expect(payload.framesPerLambda).toBe(null);
			expect(payload.concurrency).toBe(null);
		}

		expect(payloads.map((payload) => payload.streamProgress)).toEqual([
			false,
			false,
			true,
			true,
		]);
		expect(payloads.map((payload) => payload.output.type)).toEqual([
			'media',
			'sequence',
			'media',
			'sequence',
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

test('renderMediaOnLambda() sends chunks: null when no chunks are passed', async () => {
	const payload = await makePayload(undefined);

	expect(payload.chunks).toBe(null);
});
