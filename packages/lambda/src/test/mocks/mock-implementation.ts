import type {AwsProvider} from '@remotion/lambda-client';
import {estimatePrice, LambdaClientInternals} from '@remotion/lambda-client';
import {REMOTION_BUCKET_PREFIX} from '@remotion/lambda-client/constants';
import {RenderInternals} from '@remotion/renderer';
import type {ProviderSpecifics} from '@remotion/serverless';
import {createReadStream, writeFileSync} from 'fs';
import path from 'path';
import {
	getMockCallFunctionAsync,
	getMockCallFunctionStreaming,
	getMockCallFunctionSync,
} from './aws-clients';
import {deleteMockFunction, getAllMockFunctions} from './mock-functions';
import {
	addMockBucket,
	getMockBuckets,
	getS3FilesInBucket,
	mockBucketExists,
	mockDeleteS3File,
	readMockS3File,
	writeMockS3File,
} from './mock-store';

export const mockImplementation: ProviderSpecifics<AwsProvider> = {
	getAccountId: () =>
		Promise.resolve('aws:iam::123456789'.match(/aws:iam::([0-9]+)/)?.[1]!),
	getMaxNonInlinePayloadSizePerFunction: () => 200_000,
	getMaxStillInlinePayloadSize() {
		return 5_000_000;
	},
	serverStorageProductName: () => 'file system',
	applyLifeCycle: () => Promise.resolve(),
	getChromiumPath() {
		return null;
	},
	getEphemeralStorageForPriceCalculation: () =>
		LambdaClientInternals.MAX_EPHEMERAL_STORAGE_IN_MB,
	getLoggingUrlForMethod: LambdaClientInternals.getCloudwatchMethodUrl,
	getLoggingUrlForRendererFunction:
		LambdaClientInternals.getCloudwatchRendererUrl,
	createBucket: (input) => {
		addMockBucket({
			region: input.region,
			creationDate: 0,
			name: input.bucketName,
		});
		return Promise.resolve();
	},
	getBuckets: ({region}) =>
		Promise.resolve(getMockBuckets().filter((b) => b.region === region)),
	listObjects: (input) => {
		if (!input) {
			throw new Error('need to pass input');
		}

		const files = getS3FilesInBucket({
			bucketName: input.bucketName,
			region: input.region,
		});

		return Promise.resolve(
			files
				.filter((p) => p.key.startsWith(input.prefix))
				.map((file) => {
					const size = file.content.byteLength;
					return {
						Key: file.key,
						ETag: 'etag',
						LastModified: new Date(0),
						Owner: undefined,
						Size: size,
						StorageClass: undefined,
					};
				}),
		);
	},
	deleteFile: ({bucketName, key, region}) => {
		mockDeleteS3File({
			bucketName,
			key,
			region,
		});
		return Promise.resolve();
	},
	bucketExists: ({bucketName, region}) => {
		return Promise.resolve(mockBucketExists(bucketName, region));
	},
	randomHash: () => 'abcdef',
	readFile: ({bucketName, key, region}) => {
		const file = readMockS3File({region, key, bucketName});
		if (!file) {
			throw new Error(`no file ${key}`);
		}

		const tmp = path.join(RenderInternals.tmpDir('justtest'), 'test');
		writeFileSync(tmp, file.content);
		return Promise.resolve(createReadStream(tmp));
	},
	writeFile: async ({body, bucketName, key, privacy, region}) => {
		await writeMockS3File({
			body,
			bucketName,
			key,
			privacy,
			region,
		});
		return Promise.resolve(undefined);
	},
	headFile: ({bucketName, key, region}) => {
		const read = readMockS3File({
			bucketName,
			key,
			region,
		});
		if (!read) {
			const err = new Error('File not found');
			err.name = 'NotFound';
			throw err;
		}

		return Promise.resolve({
			ContentLength: read.content.toString().length,
			LastModified: new Date(),
		});
	},
	convertToServeUrl: LambdaClientInternals.convertToServeUrlImplementation,
	printLoggingHelper: false,
	validateDeleteAfter: () => {},
	callFunctionAsync: getMockCallFunctionAsync,
	callFunctionStreaming: getMockCallFunctionStreaming,
	callFunctionSync: getMockCallFunctionSync,
	estimatePrice,
	getOutputUrl: () => {
		return {
			key: 'mock/mock.mp4',
			url: 'https://s3.mock-region-1.amazonaws.com/bucket/mock.mp4',
		};
	},
	isFlakyError: LambdaClientInternals.isFlakyError,
	deleteFunction: deleteMockFunction,
	getFunctions: getAllMockFunctions,
	parseFunctionName: LambdaClientInternals.parseFunctionName,
	checkCredentials: () => Promise.resolve(),
	getBucketPrefix: () => REMOTION_BUCKET_PREFIX,
};
