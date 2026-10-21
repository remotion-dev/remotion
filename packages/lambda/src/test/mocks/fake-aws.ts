/**
 * Replaces the AWS-facing operations with in-memory fakes:
 * - S3 reads and writes go to an in-memory bucket store (./mock-store.ts)
 * - Lambda invocations run the handler in-process (./aws-clients.ts)
 * - Function management uses an in-memory function list (./mock-functions.ts)
 * - Site deployment skips bundling and uploads to the in-memory store
 *
 * Call `useFakeAws()` at the top level of a test file. To change the behavior
 * of a single operation in a test, use `fakeAws().<operation>.mockImplementation()`;
 * all operations are reset to their defaults after each test.
 *
 * Relies on ../preload.ts resolving @remotion/lambda-client to its sources.
 */
import {afterAll, afterEach, beforeAll, spyOn, type Mock} from 'bun:test';
import {createReadStream, writeFileSync} from 'node:fs';
import path from 'node:path';
import {speculateFunctionName} from '@remotion/lambda-client';
import {openBrowser, RenderInternals} from '@remotion/renderer';
import * as bucketExists from '../../../../lambda-client/src/bucket-exists';
import * as callLambdaAsync from '../../../../lambda-client/src/call-lambda-async';
import * as callLambdaStreaming from '../../../../lambda-client/src/call-lambda-streaming';
import * as callLambdaSync from '../../../../lambda-client/src/call-lambda-sync';
import * as checkCredentials from '../../../../lambda-client/src/check-credentials';
import * as createBucket from '../../../../lambda-client/src/create-bucket';
import * as deleteFile from '../../../../lambda-client/src/delete-file';
import * as deleteFunction from '../../../../lambda-client/src/delete-function';
import * as getAccountId from '../../../../lambda-client/src/get-account-id';
import * as getBuckets from '../../../../lambda-client/src/get-buckets';
import * as getFunctions from '../../../../lambda-client/src/get-functions';
import * as getOutputUrl from '../../../../lambda-client/src/get-output-url-from-metadata';
import * as headFile from '../../../../lambda-client/src/head-file';
import * as lifecycle from '../../../../lambda-client/src/lifecycle';
import * as lifecycleRules from '../../../../lambda-client/src/lifecycle-rules';
import * as listObjects from '../../../../lambda-client/src/list-objects';
import * as randomHash from '../../../../lambda-client/src/random-hash';
import * as readFile from '../../../../lambda-client/src/read-file';
import * as writeFile from '../../../../lambda-client/src/write-file';
import * as createFunction from '../../api/create-function';
import * as uploadDir from '../../api/upload-dir';
import * as browserInstance from '../../functions/get-browser-instance';
import * as currentFunctionName from '../../functions/helpers/get-current-function-name';
import * as currentMemorySize from '../../functions/helpers/get-current-memory-size';
import * as currentRegion from '../../functions/helpers/get-current-region';
import * as invokeWebhook from '../../functions/invoke-webhook';
import type {InvokeWebhookParams} from '../../functions/types';
import * as bundleSite from '../../shared/bundle-site';
import * as readDir from '../../shared/read-dir';
import {
	getMockCallFunctionAsync,
	getMockCallFunctionStreaming,
	getMockCallFunctionSync,
} from './aws-clients';
import {mockBundleSite} from './mock-bundle-site';
import {mockCreateFunction} from './mock-create-function';
import {deleteMockFunction, getAllMockFunctions} from './mock-functions';
import {mockReadDirectory} from './mock-read-dir';
import {
	addMockBucket,
	getMockBuckets,
	getS3FilesInBucket,
	mockBucketExists,
	mockDeleteS3File,
	readMockS3File,
	streamToUint8Array,
	writeMockS3File,
} from './mock-store';
import {mockUploadDir} from './upload-dir';

// Captured before the fakes replace it: render IDs must stay unique.
const realRandomHash = randomHash.randomHashImplementation;
const realGenerateRenderId = lifecycle.generateRandomHashWithLifeCycleRule;

const webhookCalls: InvokeWebhookParams[] = [];

export const getWebhookCalls = () => webhookCalls;
export const resetWebhookCalls = () => {
	webhookCalls.length = 0;
};

export type FakeAwsDefaults = {
	randomHash: typeof randomHash.randomHashImplementation;
	generateRenderId: typeof lifecycle.generateRandomHashWithLifeCycleRule;
	getAccountId: typeof getAccountId.getAccountIdImplementation;
	checkCredentials: typeof checkCredentials.checkCredentials;
	applyLifeCycle: typeof lifecycleRules.applyLifeCyleOperation;
	createBucket: typeof createBucket.createBucket;
	getBuckets: typeof getBuckets.getRemotionBuckets;
	bucketExists: typeof bucketExists.bucketExistsInRegionImplementation;
	listObjects: typeof listObjects.lambdaLsImplementation;
	deleteFile: typeof deleteFile.lambdaDeleteFileImplementation;
	readFile: typeof readFile.lambdaReadFileImplementation;
	writeFile: typeof writeFile.lambdaWriteFileImplementation;
	writeFileIfNotExists: typeof writeFile.lambdaWriteFileIfNotExistsImplementation;
	supportsConditionalOutput: typeof writeFile.supportsConditionalOutput;
	headFile: typeof headFile.lambdaHeadFileImplementation;
	getOutputUrl: typeof getOutputUrl.getOutputUrlFromMetadata;
	callFunctionAsync: typeof callLambdaAsync.callFunctionAsyncImplementation;
	callFunctionStreaming: typeof callLambdaStreaming.callFunctionWithStreamingImplementation;
	callFunctionSync: typeof callLambdaSync.callFunctionSyncImplementation;
	getFunctions: typeof getFunctions.getFunctions;
	deleteFunction: typeof deleteFunction.deleteFunction;
	invokeWebhook: typeof invokeWebhook.invokeWebhook;
	bundleSite: typeof bundleSite.bundleSite;
	readDirectory: typeof readDir.readDirectory;
	uploadDir: typeof uploadDir.uploadDir;
	createFunction: typeof createFunction.createFunction;
	getBrowserInstance: typeof browserInstance.getBrowserInstance;
	forgetBrowserEventLoop: typeof browserInstance.forgetBrowserEventLoop;
	closeBrowserInstance: typeof browserInstance.closeBrowserInstance;
	getCurrentRegionInFunction: typeof currentRegion.getCurrentRegionInFunction;
	getCurrentFunctionName: typeof currentFunctionName.getCurrentFunctionName;
	getCurrentMemorySizeInMb: typeof currentMemorySize.getCurrentMemorySizeInMb;
};

export type FakeAwsSpies = {
	[K in keyof FakeAwsDefaults]: Mock<FakeAwsDefaults[K]>;
};

export const fakeAwsDefaults: FakeAwsDefaults = {
	// Deterministic bucket names, but unique render IDs.
	randomHash: () => 'abcdef',
	generateRenderId: ({deleteAfter}) =>
		realGenerateRenderId({deleteAfter, randomHashFn: realRandomHash}),
	getAccountId: () => Promise.resolve('123456789'),
	checkCredentials: () => undefined,
	applyLifeCycle: () => Promise.resolve(),
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
	bucketExists: ({bucketName, region}) =>
		Promise.resolve(mockBucketExists(bucketName, region)),
	listObjects: (input) => {
		const files = getS3FilesInBucket({
			bucketName: input.bucketName,
			region: input.region,
		});

		return Promise.resolve(
			files
				.filter((p) => p.key.startsWith(input.prefix))
				.map((file) => ({
					Key: file.key,
					ETag: 'etag',
					LastModified: new Date(0),
					Size: file.content.byteLength,
				})),
		);
	},
	deleteFile: ({bucketName, key, region}) => {
		mockDeleteS3File({bucketName, key, region});
		return Promise.resolve();
	},
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
		await writeMockS3File({body, bucketName, key, privacy, region});
	},
	writeFileIfNotExists: async ({body, bucketName, key, privacy, region}) => {
		const content = await streamToUint8Array(body);
		if (readMockS3File({region, bucketName, key})) {
			throw new Error(
				`Output file "${key}" in bucket "${bucketName}" already exists.`,
			);
		}

		await writeMockS3File({body: content, bucketName, key, privacy, region});
	},
	supportsConditionalOutput: () => true,
	headFile: ({bucketName, key, region}) => {
		const read = readMockS3File({bucketName, key, region});
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
	getOutputUrl: () => ({
		key: 'mock/mock.mp4',
		url: 'https://s3.mock-region-1.amazonaws.com/bucket/mock.mp4',
	}),
	callFunctionAsync: getMockCallFunctionAsync,
	callFunctionStreaming: getMockCallFunctionStreaming,
	callFunctionSync: getMockCallFunctionSync,
	getFunctions: getAllMockFunctions,
	deleteFunction: deleteMockFunction,
	invokeWebhook: (params) => {
		webhookCalls.push(params);
		return Promise.resolve();
	},
	bundleSite: mockBundleSite,
	readDirectory: mockReadDirectory,
	uploadDir: mockUploadDir,
	createFunction: mockCreateFunction,
	// Bun's WebSocket has no Node socket to ref()/unref(), so the warm-function
	// browser cache cannot be exercised here. Open a browser per invocation.
	getBrowserInstance: async ({logLevel}) => {
		const instance = await openBrowser('chrome', {logLevel});
		return {instance, configurationString: 'chrome'};
	},
	forgetBrowserEventLoop: ({launchedBrowser}) => {
		launchedBrowser.instance.close({silent: false});
	},
	closeBrowserInstance: async ({launchedBrowser}) => {
		await launchedBrowser.instance.close({silent: true});
	},
	// Identity of the simulated Lambda function.
	getCurrentRegionInFunction: () => 'eu-central-1',
	getCurrentFunctionName: () =>
		speculateFunctionName({
			diskSizeInMb: 10240,
			memorySizeInMb: 3009,
			timeoutInSeconds: 120,
		}),
	getCurrentMemorySizeInMb: () => 3009,
};

const makeSpies = (): FakeAwsSpies => ({
	randomHash: spyOn(randomHash, 'randomHashImplementation'),
	generateRenderId: spyOn(lifecycle, 'generateRandomHashWithLifeCycleRule'),
	getAccountId: spyOn(getAccountId, 'getAccountIdImplementation'),
	checkCredentials: spyOn(checkCredentials, 'checkCredentials'),
	applyLifeCycle: spyOn(lifecycleRules, 'applyLifeCyleOperation'),
	createBucket: spyOn(createBucket, 'createBucket'),
	getBuckets: spyOn(getBuckets, 'getRemotionBuckets'),
	bucketExists: spyOn(bucketExists, 'bucketExistsInRegionImplementation'),
	listObjects: spyOn(listObjects, 'lambdaLsImplementation'),
	deleteFile: spyOn(deleteFile, 'lambdaDeleteFileImplementation'),
	readFile: spyOn(readFile, 'lambdaReadFileImplementation'),
	writeFile: spyOn(writeFile, 'lambdaWriteFileImplementation'),
	writeFileIfNotExists: spyOn(
		writeFile,
		'lambdaWriteFileIfNotExistsImplementation',
	),
	supportsConditionalOutput: spyOn(writeFile, 'supportsConditionalOutput'),
	headFile: spyOn(headFile, 'lambdaHeadFileImplementation'),
	getOutputUrl: spyOn(getOutputUrl, 'getOutputUrlFromMetadata'),
	callFunctionAsync: spyOn(callLambdaAsync, 'callFunctionAsyncImplementation'),
	callFunctionStreaming: spyOn(
		callLambdaStreaming,
		'callFunctionWithStreamingImplementation',
	),
	callFunctionSync: spyOn(callLambdaSync, 'callFunctionSyncImplementation'),
	getFunctions: spyOn(getFunctions, 'getFunctions'),
	deleteFunction: spyOn(deleteFunction, 'deleteFunction'),
	invokeWebhook: spyOn(invokeWebhook, 'invokeWebhook'),
	bundleSite: spyOn(bundleSite, 'bundleSite'),
	readDirectory: spyOn(readDir, 'readDirectory'),
	uploadDir: spyOn(uploadDir, 'uploadDir'),
	createFunction: spyOn(createFunction, 'createFunction'),
	getBrowserInstance: spyOn(browserInstance, 'getBrowserInstance'),
	forgetBrowserEventLoop: spyOn(browserInstance, 'forgetBrowserEventLoop'),
	closeBrowserInstance: spyOn(browserInstance, 'closeBrowserInstance'),
	getCurrentRegionInFunction: spyOn(
		currentRegion,
		'getCurrentRegionInFunction',
	),
	getCurrentFunctionName: spyOn(currentFunctionName, 'getCurrentFunctionName'),
	getCurrentMemorySizeInMb: spyOn(
		currentMemorySize,
		'getCurrentMemorySizeInMb',
	),
});

let spies: FakeAwsSpies | null = null;

export const resetFakeAws = () => {
	if (!spies) {
		return;
	}

	for (const key of Object.keys(spies) as (keyof FakeAwsSpies)[]) {
		spies[key].mockImplementation(fakeAwsDefaults[key] as never);
	}
};

export const installFakeAws = () => {
	if (spies) {
		return;
	}

	spies = makeSpies();
	resetFakeAws();
};

export const uninstallFakeAws = () => {
	if (!spies) {
		return;
	}

	for (const spy of Object.values(spies)) {
		spy.mockRestore();
	}

	spies = null;
};

export const fakeAws = (): FakeAwsSpies => {
	if (!spies) {
		throw new Error('Call useFakeAws() at the top of the test file first');
	}

	return spies;
};

export const useFakeAws = () => {
	beforeAll(installFakeAws);
	afterEach(resetFakeAws);
	afterAll(uninstallFakeAws);
};
