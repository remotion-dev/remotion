import type {AwsProvider} from '@remotion/lambda-client';
import {
	LambdaClientInternals,
	speculateFunctionName,
} from '@remotion/lambda-client';
import {openBrowser} from '@remotion/renderer';
import type {
	FullClientSpecifics,
	GetBrowserInstance,
	InsideFunctionSpecifics,
	InvokeWebhookParams,
} from '@remotion/serverless';
import {Log} from '../cli/log';
import {mockBundleSite} from './mocks/mock-bundle-site';
import {mockCreateFunction} from './mocks/mock-create-function';
import {mockReadDirectory} from './mocks/mock-read-dir';
import {mockUploadDir} from './mocks/upload-dir';

const browsersOpen: Map<string, boolean> = new Map();
export const getBrowserInstance: GetBrowserInstance = async ({
	logLevel,
	indent,
}) => {
	const instance = await openBrowser('chrome', {logLevel});
	browsersOpen.set(instance.id, true);
	Log.verbose(
		{logLevel, indent},
		`Opening new browser instance ${instance.id}. ${browsersOpen.size} browsers open`,
	);
	return {instance, configurationString: 'chrome'};
};

const paramsArray: InvokeWebhookParams[] = [];

export const mockServerImplementation: InsideFunctionSpecifics<AwsProvider> = {
	forgetBrowserEventLoop: ({launchedBrowser}) => {
		browsersOpen.delete(launchedBrowser.instance.id);

		Log.verbose(
			{logLevel: 'verbose', indent: false},
			`Closing browser instance ${launchedBrowser.instance.id}. ${browsersOpen.size} browsers open`,
		);
		launchedBrowser.instance.close({silent: false});
	},
	getCurrentRegionInFunction: () => 'eu-central-1',
	getBrowserInstance,
	timer: () => ({
		end: () => {},
	}),
	deleteTmpDir: () => Promise.resolve(),
	generateRandomId: LambdaClientInternals.randomHashImplementation,
	getCurrentFunctionName: () =>
		speculateFunctionName({
			diskSizeInMb: 10240,
			memorySizeInMb: 3009,
			timeoutInSeconds: 120,
		}),
	getCurrentMemorySizeInMb: () => 3009,
	invokeWebhook: (params) => {
		paramsArray.push(params);
		return Promise.resolve();
	},
	getFolderFiles: () => [
		{
			filename: 'something',
			size: 0,
		},
	],
	makeArtifactWithDetails: () => ({
		filename: 'something',
		sizeInBytes: 0,
		s3Url: 'https://s3.af-south-1.amazonaws.com/bucket/key',
		s3Key: 'key',
	}),
};

export const resetWebhookCalls = () => {
	paramsArray.length = 0;
};

export const getWebhookCalls = () => {
	return paramsArray;
};

export const mockFullClientSpecifics: FullClientSpecifics<AwsProvider> = {
	bundleSite: mockBundleSite,
	id: '__remotion_full_client_specifics',
	readDirectory: mockReadDirectory,
	uploadDir: mockUploadDir,
	createFunction: mockCreateFunction,
};
