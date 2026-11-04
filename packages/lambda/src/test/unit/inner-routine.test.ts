import {afterEach, expect, spyOn, test} from 'bun:test';
import {Readable} from 'node:stream';
import {ServerlessRoutines} from '@remotion/lambda-client';
import {VERSION} from 'remotion/version';
import * as lifecycle from '../../../../lambda-client/src/lifecycle';
import * as readFile from '../../../../lambda-client/src/read-file';
import * as currentFunctionName from '../../functions/helpers/get-current-function-name';
import * as currentMemorySize from '../../functions/helpers/get-current-memory-size';
import * as currentRegion from '../../functions/helpers/get-current-region';
import {innerHandler, innerRoutine} from '../../functions/inner-routine';
import {makeInitialOverallRenderProgress} from '../../functions/overall-render-progress';

const spies: {mockRestore: () => void}[] = [];

afterEach(() => {
	spies.splice(0).forEach((spy) => spy.mockRestore());
});

test('progress works without AWS context or a bucket owner', async () => {
	const previousFlag = process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA;
	delete process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA;
	const chunks: Uint8Array[] = [];
	let ended = false;
	const reads: Array<string | null> = [];
	spies.push(
		spyOn(readFile, 'lambdaReadFileImplementation').mockImplementation(
			({expectedBucketOwner}) => {
				reads.push(expectedBucketOwner);
				return Promise.resolve(
					Readable.from([
						Buffer.from(
							JSON.stringify(
								makeInitialOverallRenderProgress(Date.now() + 120_000, false),
							),
						),
					]),
				);
			},
		),
		spyOn(currentRegion, 'getCurrentRegionInFunction').mockReturnValue(
			'eu-central-1',
		),
		spyOn(currentMemorySize, 'getCurrentMemorySizeInMb').mockReturnValue(2048),
		spyOn(currentFunctionName, 'getCurrentFunctionName').mockReturnValue(
			'render-worker',
		),
	);

	try {
		await innerHandler({
			params: {
				type: ServerlessRoutines.status,
				version: VERSION,
				logLevel: 'error',
				bucketName: 'render-storage',
				renderId: 'render-id',
				forcePathStyle: false,
				s3OutputProvider: null,
			},
			context: {
				requestId: 'request-id',
				expectedBucketOwner: null,
				getRemainingTimeInMillis: () => 120_000,
			},
			responseWriter: {
				write: (message) => {
					chunks.push(message);
					return Promise.resolve();
				},
				end: () => {
					ended = true;
					return Promise.resolve();
				},
			},
		});

		expect(ended).toBe(true);
		expect(JSON.parse(Buffer.concat(chunks).toString())).toMatchObject({
			type: 'success',
			renderId: 'render-id',
			bucket: 'render-storage',
			done: false,
		});
		expect(reads).toEqual([null]);
		expect(process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA).toBeUndefined();
	} finally {
		if (previousFlag === undefined) {
			delete process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA;
		} else {
			process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = previousFlag;
		}
	}
});

test('buffered still errors are written to the response', async () => {
	const chunks: Uint8Array[] = [];
	let ended = false;

	await innerHandler({
		params: {
			type: 'still',
			streamed: false,
			version: VERSION,
			downloadBehavior: 'invalid',
			deleteAfter: null,
			maxRetries: 0,
			frame: 0,
			attempt: 1,
			logLevel: 'error',
		} as never,
		responseWriter: {
			write: (message) => {
				chunks.push(message);
				return Promise.resolve();
			},
			end: () => {
				ended = true;
				return Promise.resolve();
			},
		},
		context: {
			requestId: 'request-id',
			expectedBucketOwner: null,
			getRemainingTimeInMillis: () => 120_000,
		},
	});

	expect(ended).toBe(true);
	expect(chunks).toHaveLength(1);
	const response = JSON.parse(new TextDecoder().decode(chunks[0])) as {
		type: string;
		message: string;
		stack: string;
	};
	expect(response).toMatchObject({
		type: 'error',
		message: 'downloadBehavior must be null or an object',
	});
	expect(response.stack).toContain(
		'Error: downloadBehavior must be null or an object',
	);
});

test('buffered render start exceptions are written to the response', async () => {
	const chunks: Uint8Array[] = [];
	let ended = false;
	spies.push(
		spyOn(lifecycle, 'generateRandomHashWithLifeCycleRule').mockImplementation(
			() => {
				throw new Error('Could not generate a render ID');
			},
		),
	);

	await innerRoutine({
		params: {
			type: 'start',
			output: {type: 'media'},
			version: VERSION,
			logLevel: 'error',
			deleteAfter: null,
		} as never,
		responseWriter: {
			write: (message) => {
				chunks.push(message);
				return Promise.resolve();
			},
			end: () => {
				ended = true;
				return Promise.resolve();
			},
		},
		context: {
			requestId: 'request-id',
			expectedBucketOwner: null,
			getRemainingTimeInMillis: () => 120_000,
		},
	});

	expect(ended).toBe(true);
	expect(chunks).toHaveLength(1);
	const response = JSON.parse(new TextDecoder().decode(chunks[0])) as {
		type: string;
		message: string;
		stack: string;
	};
	expect(response).toMatchObject({
		type: 'error',
		message: 'Could not generate a render ID',
	});
	expect(response.stack).toContain('Error: Could not generate a render ID');
});
