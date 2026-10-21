import {expect, spyOn, test} from 'bun:test';
import {ServerlessRoutines} from '@remotion/lambda-client';
import {VERSION} from 'remotion/version';
import * as readFile from '../../../../lambda-client/src/read-file';
import {routine} from '../../functions';
import * as cleanTmpdir from '../../functions/helpers/clean-tmpdir';
import * as currentFunctionName from '../../functions/helpers/get-current-function-name';
import * as currentMemorySize from '../../functions/helpers/get-current-memory-size';
import * as currentRegion from '../../functions/helpers/get-current-region';
import {ResponseStream} from '../../functions/streaming/response-stream';

test('Lambda context is normalized while preserving storage ownership', async () => {
	const previousFlag = process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA;
	// Replace Lambda's filesystem and runtime environment, keeping dispatch and
	// progress handling real. The real cleanup deletes the Lambda /tmp directory.
	const cleanup = spyOn(cleanTmpdir, 'deleteTmpDir').mockImplementation(
		() => undefined,
	);
	const region = spyOn(
		currentRegion,
		'getCurrentRegionInFunction',
	).mockReturnValue('us-east-1');
	const memory = spyOn(
		currentMemorySize,
		'getCurrentMemorySizeInMb',
	).mockReturnValue(2048);
	const name = spyOn(
		currentFunctionName,
		'getCurrentFunctionName',
	).mockReturnValue('render-worker');
	const storageError = new Error('Storage unavailable');
	const read = spyOn(
		readFile,
		'lambdaReadFileImplementation',
	).mockRejectedValue(storageError);
	const context = {
		awsRequestId: 'request-id',
		invokedFunctionArn:
			'arn:aws:lambda:us-east-1:123456789012:function:render-worker',
		getRemainingTimeInMillis: () => 120_000,
	};

	try {
		const infoStream = new ResponseStream();
		await routine(
			{type: ServerlessRoutines.info, logLevel: 'error'},
			infoStream,
			context,
		);
		expect(JSON.parse(infoStream.getBufferedData().toString())).toEqual({
			type: 'success',
			version: VERSION,
		});
		expect(infoStream.writableEnded).toBe(true);
		expect(process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA).toBe('true');

		await expect(
			routine(
				{
					type: ServerlessRoutines.status,
					version: VERSION,
					logLevel: 'error',
					bucketName: 'render-storage',
					renderId: 'render-id',
					forcePathStyle: false,
					s3OutputProvider: null,
				},
				new ResponseStream(),
				context,
			),
		).rejects.toBe(storageError);
		expect(read).toHaveBeenCalledWith(
			expect.objectContaining({
				expectedBucketOwner: '123456789012',
				bucketName: 'render-storage',
				key: 'renders/render-id/progress.json',
			}),
		);
	} finally {
		cleanup.mockRestore();
		region.mockRestore();
		memory.mockRestore();
		name.mockRestore();
		read.mockRestore();
		if (previousFlag === undefined) {
			delete process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA;
		} else {
			process.env.__RESERVED_IS_INSIDE_REMOTION_LAMBDA = previousFlag;
		}
	}
});

test('buffered routines serialize exceptions and end the response', async () => {
	for (const type of [
		ServerlessRoutines.info,
		ServerlessRoutines.start,
		ServerlessRoutines.compositions,
	]) {
		const responseStream = new ResponseStream();

		await routine(
			{
				type,
				version: VERSION,
				logLevel: 'error',
			} as never,
			responseStream,
			{
				awsRequestId: 'request-id',
				invokedFunctionArn: '',
				getRemainingTimeInMillis: () => 120_000,
			},
		);

		expect(responseStream.writableEnded).toBe(true);
		const response = JSON.parse(
			new TextDecoder().decode(responseStream.getBufferedData()),
		) as {
			type: string;
			message: string;
			stack: string;
		};
		expect(response).toMatchObject({
			type: 'error',
			message:
				'Lambda function unexpectedly does not have context.invokedFunctionArn',
		});
		expect(response.stack).toContain(
			'Error: Lambda function unexpectedly does not have context.invokedFunctionArn',
		);
	}
});
