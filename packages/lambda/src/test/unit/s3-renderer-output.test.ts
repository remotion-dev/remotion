import {expect, spyOn, test} from 'bun:test';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {Readable} from 'node:stream';
import * as writeFileModule from '../../../../lambda-client/src/write-file';
import {makeS3RendererOutput} from '../../functions/s3-renderer-output';

const bodyToBytes = async (
	body: string | Uint8Array | NodeJS.ReadableStream,
) => {
	if (typeof body === 'string') {
		return new TextEncoder().encode(body);
	}

	if (body instanceof Uint8Array) {
		return body;
	}

	const chunks: Uint8Array[] = [];
	for await (const chunk of body) {
		chunks.push(
			typeof chunk === 'string'
				? new TextEncoder().encode(chunk)
				: new Uint8Array(chunk),
		);
	}

	const length = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
	const result = new Uint8Array(length);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return result;
};

test('S3 renderer output publishes media and artifacts before completion', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'remotion-s3-output-'));
	const objects = new Map<string, Uint8Array>();
	const statusWrites: Array<Record<string, unknown>> = [];
	const write = spyOn(
		writeFileModule,
		'lambdaWriteFileImplementation',
	).mockImplementation(async ({key, body}) => {
		const bytes = await bodyToBytes(body as string | Uint8Array | Readable);
		objects.set(key, bytes);
		if (key.endsWith('/status.json')) {
			statusWrites.push(
				JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>,
			);
		}
	});
	try {
		const video = join(directory, 'video');
		const audio = join(directory, 'audio');
		await writeFile(video, 'video-content');
		await writeFile(audio, 'audio-content');

		const output = makeS3RendererOutput({
			params: {
				type: 'renderer',
				output: {type: 'media'},
				bucketName: 'bucket',
				renderId: 'render-id',
				chunk: 1,
				attempt: 2,
				forcePathStyle: false,
			} as never,
			expectedBucketOwner: 'owner',
			region: 'eu-central-1',
		});

		await output.initialize();
		await output.onStream({
			type: 'lambda-invoked',
			payload: {attempt: 2},
		});
		await output.onStream({
			type: 'frames-rendered',
			payload: {rendered: 10, encoded: 8},
		});
		await output.onStream({
			type: 'artifact-emitted',
			payload: {
				artifact: {
					filename: 'artifact.txt',
					stringContent: 'artifact-content',
					frame: 4,
					binary: false,
					downloadBehavior: null,
				},
			},
		});
		await output.uploadMediaAndComplete({
			videoOutputLocation: video,
			audioOutputLocation: audio,
			isAudioOnly: false,
			completedAt: 200,
		});

		expect(statusWrites.map((status) => status.state)).toEqual([
			'running',
			'running',
			'running',
			'completed',
		]);
		const completed = statusWrites.at(-1)!;
		expect(completed).toMatchObject({
			state: 'completed',
			chunk: 1,
			attempt: 2,
			lambdaInvoked: true,
			renderedFrames: 10,
			encodedFrames: 8,
			uploadedFrames: 0,
			uploadedSizeInBytes: 0,
			videoKey: 'renders/render-id/transport/chunks/1/attempt-2/video',
			audioKey: 'renders/render-id/transport/chunks/1/attempt-2/audio',
		});
		expect(
			new TextDecoder().decode(
				objects.get('renders/render-id/transport/chunks/1/attempt-2/video'),
			),
		).toBe('video-content');
		expect(
			new TextDecoder().decode(
				objects.get(
					'renders/render-id/transport/chunks/1/attempt-2/artifacts/0',
				),
			),
		).toBe('artifact-content');
	} finally {
		write.mockRestore();
		await rm(directory, {recursive: true, force: true});
	}
});
