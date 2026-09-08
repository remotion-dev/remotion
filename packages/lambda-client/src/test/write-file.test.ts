import {afterAll, beforeAll, expect, test} from 'bun:test';
import {Readable} from 'node:stream';
import type {S3Client} from '@aws-sdk/client-s3';
import type {WriteFileInput} from '@remotion/serverless-client';
import {awsImplementation, type AwsProvider} from '../aws-provider';
import type {RequestHandler} from '../types';

const previousAccessKey = process.env.REMOTION_AWS_ACCESS_KEY_ID;
const previousSecretKey = process.env.REMOTION_AWS_SECRET_ACCESS_KEY;
beforeAll(() => {
	process.env.REMOTION_AWS_ACCESS_KEY_ID = 'test-access-key';
	process.env.REMOTION_AWS_SECRET_ACCESS_KEY = 'test-secret-key';
});
afterAll(() => {
	if (previousAccessKey === undefined)
		delete process.env.REMOTION_AWS_ACCESS_KEY_ID;
	else process.env.REMOTION_AWS_ACCESS_KEY_ID = previousAccessKey;
	if (previousSecretKey === undefined)
		delete process.env.REMOTION_AWS_SECRET_ACCESS_KEY;
	else process.env.REMOTION_AWS_SECRET_ACCESS_KEY = previousSecretKey;
});

test.each(['buffer', 'stream', 'multipart'] as const)(
	'write-only S3 %s uploads preserve existing outputs and allow explicit overwrites',
	async (kind) => {
		const objects = new Map<string, {body: Buffer; renderId: string | null}>();
		const uploads = new Map<
			string,
			{parts: Map<number, Buffer>; renderId: string | null}
		>();
		let nextUpload = 0;
		let conditionalRequests = 0;
		let completedMultipart = 0;
		let aborts = 0;
		let denyWrites = false;
		let allowReads = false;
		let denyAbort = false;
		let writeRequests = 0;
		// Only the AWS HTTP boundary is faked. Exercise the real SDK and lib-storage.
		const requestHandler: RequestHandler = {
			handle: (
				request: Parameters<S3Client['config']['requestHandler']['handle']>[0],
			) => {
				let statusCode = 200;
				let responseBody = '';
				const headers: Record<string, string> = {};
				const uploadId = String(request.query.uploadId ?? '');
				if (request.method === 'HEAD') {
					const object = objects.get(request.path);
					if (!allowReads) {
						statusCode = 403;
					} else if (!object) {
						statusCode = 404;
					} else {
						headers['content-length'] = String(object.body.length);
						if (object.renderId) {
							headers['x-amz-meta-remotion-render-id'] = object.renderId;
						}
					}
				} else if (request.method === 'DELETE') {
					aborts++;
					if (denyAbort) {
						statusCode = 403;
						responseBody =
							'<Error><Code>AccessDenied</Code><Message>Cleanup denied</Message></Error>';
					} else {
						uploads.delete(uploadId);
						statusCode = 204;
					}
				} else if (denyWrites) {
					writeRequests++;
					statusCode = 403;
					responseBody =
						'<Error><Code>AccessDenied</Code><Message>Write denied</Message></Error>';
				} else if (request.method === 'POST' && 'uploads' in request.query) {
					const id = `upload-${++nextUpload}`;
					uploads.set(id, {
						parts: new Map(),
						renderId: request.headers['x-amz-meta-remotion-render-id'] ?? null,
					});
					responseBody = `<InitiateMultipartUploadResult><UploadId>${id}</UploadId></InitiateMultipartUploadResult>`;
				} else if (request.method === 'PUT' && uploadId) {
					uploads
						.get(uploadId)!
						.parts.set(
							Number(request.query.partNumber),
							Buffer.from(request.body),
						);
					headers.etag = `"part-${request.query.partNumber}"`;
				} else if (
					request.method === 'PUT' ||
					(request.method === 'POST' && uploadId)
				) {
					const conditional = request.headers['if-none-match'] === '*';
					conditionalRequests += Number(conditional);
					if (conditional && objects.has(request.path)) {
						statusCode = 412;
						responseBody =
							'<Error><Code>PreconditionFailed</Code><Message>Already exists</Message></Error>';
					} else {
						const upload = uploads.get(uploadId);
						const body = upload
							? Buffer.concat(
									[...upload.parts.entries()]
										.sort((a, b) => a[0] - b[0])
										.map((part) => Uint8Array.from(part[1])),
								)
							: Buffer.from(request.body);
						objects.set(request.path, {
							body,
							renderId:
								upload?.renderId ??
								request.headers['x-amz-meta-remotion-render-id'] ??
								null,
						});
						headers.etag = '"output"';
						if (upload) {
							completedMultipart++;
							uploads.delete(uploadId);
							responseBody =
								'<CompleteMultipartUploadResult><Location>https://bucket.s3.amazonaws.com/video.mp4</Location><Bucket>bucket</Bucket><Key>video.mp4</Key><ETag>"output"</ETag></CompleteMultipartUploadResult>';
						}
					}
				} else {
					throw new Error(
						`Unexpected AWS request: ${request.method} ${request.path}`,
					);
				}

				return Promise.resolve({
					response: {statusCode, headers, body: Readable.from([responseBody])},
				});
			},
		};
		const content = Buffer.alloc(
			kind === 'multipart' ? 6 * 1024 * 1024 : 16,
			42,
		);
		const options = (): WriteFileInput<AwsProvider> => ({
			body:
				kind === 'buffer' ? Uint8Array.from(content) : Readable.from([content]),
			bucketName: 'bucket',
			key: 'video.mp4',
			region: 'us-east-1',
			privacy: 'no-acl',
			customCredentials: null,
			expectedBucketOwner: null,
			downloadBehavior: null,
			forcePathStyle: true,
			storageClass: null,
			requestHandler,
		});
		const write = (renderId: string) =>
			awsImplementation.writeFileIfNotExists!({...options(), renderId});
		await expect(awsImplementation.headFile(options())).rejects.toMatchObject({
			$metadata: {httpStatusCode: 403},
		});
		await write('first');
		allowReads = true;
		await expect(awsImplementation.headFile(options())).resolves.toMatchObject({
			renderId: 'first',
			ContentLength: content.length,
		});
		allowReads = false;
		expect([...objects.keys()]).toEqual(['/video.mp4']);
		expect(
			objects.get('/video.mp4')!.body.equals(Uint8Array.from(content)),
		).toBe(true);
		expect(objects.get('/video.mp4')!.renderId).toBe('first');
		await expect(write('second')).rejects.toThrow('already exists');
		expect(objects.get('/video.mp4')!.renderId).toBe('first');
		expect(conditionalRequests).toBe(2);
		if (kind === 'multipart') {
			expect(completedMultipart).toBe(1);
			expect(aborts).toBe(1);
			expect(uploads.size).toBe(0);
		}

		objects.clear();
		const concurrent = await Promise.allSettled([write('a'), write('b')]);
		expect(
			concurrent.filter((result) => result.status === 'fulfilled'),
		).toHaveLength(1);
		expect(
			concurrent.filter((result) => result.status === 'rejected'),
		).toHaveLength(1);
		expect(
			objects.get('/video.mp4')!.body.equals(Uint8Array.from(content)),
		).toBe(true);

		await awsImplementation.writeFile({...options(), body: 'replacement'});
		expect(objects.get('/video.mp4')).toEqual({
			body: Buffer.from('replacement'),
			renderId: null,
		});
		if (kind === 'multipart') {
			denyAbort = true;
			await expect(write('cleanup-denied')).rejects.toThrow('already exists');
			expect(objects.get('/video.mp4')!.body.toString()).toBe('replacement');
		}

		if (kind === 'stream') {
			// Upload has already consumed the stream: never retry it with an empty body.
			denyWrites = true;
			await expect(awsImplementation.writeFile(options())).rejects.toThrow(
				'Write denied',
			);
			expect(writeRequests).toBe(1);
		}
	},
);
