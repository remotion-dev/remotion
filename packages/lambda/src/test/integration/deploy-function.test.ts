import {expect, test} from 'bun:test';
import {
	LambdaClientInternals,
	speculateFunctionName,
} from '@remotion/lambda-client';
import {VERSION} from 'remotion/version';
import {internalDeployFunction} from '../../api/deploy-function';
import {mockFullClientSpecifics} from '../mock-implementation';
import {
	clearMockCreateFunctionCalls,
	getMockCreateFunctionCalls,
} from '../mocks/mock-create-function';
import {
	cleanFnStore,
	markFunctionAsIncompatible,
} from '../mocks/mock-functions';
import {mockImplementation} from '../mocks/mock-implementation';

const {DEFAULT_EPHEMERAL_STORAGE_IN_MB} = LambdaClientInternals;

const chromiumLayer =
	'arn:aws:lambda:us-east-1:123456789012:layer:custom-chromium:1';
const fontsLayer = 'arn:aws:lambda:us-east-1:123456789012:layer:custom-fonts:3';

test('Should be able to deploy function', async () => {
	const {functionName} = await internalDeployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		customRoleArn: undefined,
		customLayerArns: null,
		diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		enableLambdaInsights: true,
		indent: false,
		logLevel: 'info',
		providerSpecifics: mockImplementation,
		fullClientSpecifics: mockFullClientSpecifics,
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
		requestHandler: null,
	});
	expect(functionName).toBe(
		speculateFunctionName({
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			diskSizeInMb: LambdaClientInternals.DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		}),
	);
});

test('Should be able to get the function afterwards', async () => {
	cleanFnStore();

	const {functionName} = await internalDeployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		customRoleArn: undefined,
		customLayerArns: null,
		diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		enableLambdaInsights: true,
		indent: false,
		logLevel: 'info',
		providerSpecifics: mockImplementation,
		fullClientSpecifics: mockFullClientSpecifics,
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
		requestHandler: null,
	});
	expect(functionName).toBe(
		speculateFunctionName({
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		}),
	);
	const fns = await mockImplementation.getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: speculateFunctionName({
				memorySizeInMb: 2048,
				timeoutInSeconds: 120,
				diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
			}),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: VERSION,
			diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		},
	]);
	const foreignFunctions = await mockImplementation.getFunctions({
		region: 'us-east-2',
		compatibleOnly: true,
	});
	expect(foreignFunctions).toEqual([]);
});

test('Should be able to delete the function', async () => {
	cleanFnStore();

	const {functionName} = await internalDeployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		customRoleArn: undefined,
		customLayerArns: null,
		diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		enableLambdaInsights: true,
		indent: false,
		logLevel: 'info',
		providerSpecifics: mockImplementation,
		fullClientSpecifics: mockFullClientSpecifics,
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
		requestHandler: null,
	});
	expect(functionName).toBe(
		speculateFunctionName({
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		}),
	);
	mockImplementation.deleteFunction({
		region: 'us-east-1',
		functionName: speculateFunctionName({
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		}),
	});
	const fns = await mockImplementation.getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([]);
});

test('Should apply custom Layers when creating and reusing a function', async () => {
	cleanFnStore();
	clearMockCreateFunctionCalls();

	const input = {
		memorySizeInMb: 2048,
		region: 'us-east-1' as const,
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		customRoleArn: undefined,
		diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		enableLambdaInsights: false,
		indent: false,
		logLevel: 'info' as const,
		providerSpecifics: mockImplementation,
		fullClientSpecifics: mockFullClientSpecifics,
		runtimePreference: 'default' as const,
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
		requestHandler: null,
	};

	const first = await internalDeployFunction({
		...input,
		customLayerArns: [chromiumLayer, fontsLayer],
	});
	const updatedLayers = [chromiumLayer.replace(/:1$/, ':2'), fontsLayer];
	const second = await internalDeployFunction({
		...input,
		customLayerArns: updatedLayers,
	});

	expect(first.alreadyExisted).toBe(false);
	expect(second.alreadyExisted).toBe(true);
	expect(getMockCreateFunctionCalls()).toHaveLength(2);
	expect(getMockCreateFunctionCalls()[0].customLayerArns).toEqual([
		chromiumLayer,
		fontsLayer,
	]);
	expect(getMockCreateFunctionCalls()[0].alreadyCreated).toBe(false);
	expect(getMockCreateFunctionCalls()[1].customLayerArns).toEqual(
		updatedLayers,
	);
	expect(getMockCreateFunctionCalls()[1].alreadyCreated).toBe(true);
});

test('Should validate custom Layers before calling the Provider', async () => {
	let providerCalls = 0;
	const providerSpecifics = {
		...mockImplementation,
		getAccountId: () => {
			providerCalls++;
			return Promise.resolve('123456789012');
		},
	};
	const invalidInputs = [
		{customLayerArns: [chromiumLayer.slice(0, -2)]},
		{customLayerArns: [chromiumLayer.replace(':lambda:', ':s3:')]},
		{customLayerArns: [chromiumLayer.replace('us-east-1', 'eu-west-1')]},
		{customLayerArns: []},
		{customLayerArns: [chromiumLayer, chromiumLayer]},
		{
			customLayerArns: Array.from({length: 5}, (_, index) =>
				chromiumLayer.replace(/:1$/, `:${index + 1}`),
			),
			enableLambdaInsights: true,
		},
		{customLayerArns: [chromiumLayer], runtimePreference: 'cjk' as const},
	];

	for (const invalidInput of invalidInputs) {
		await expect(
			internalDeployFunction({
				memorySizeInMb: 2048,
				region: 'us-east-1',
				timeoutInSeconds: 120,
				createCloudWatchLogGroup: true,
				customRoleArn: undefined,
				customLayerArns: invalidInput.customLayerArns,
				diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
				enableLambdaInsights: invalidInput.enableLambdaInsights ?? false,
				indent: false,
				logLevel: 'info',
				providerSpecifics,
				fullClientSpecifics: mockFullClientSpecifics,
				runtimePreference: invalidInput.runtimePreference ?? 'default',
				vpcSecurityGroupIds: undefined,
				vpcSubnetIds: undefined,
				cloudWatchLogRetentionPeriodInDays: undefined,
				requestHandler: null,
			}),
		).rejects.toThrow();
	}

	expect(providerCalls).toBe(0);
});

test('Should pass null to the hosted Layer path by default', async () => {
	cleanFnStore();
	clearMockCreateFunctionCalls();

	await internalDeployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		customRoleArn: undefined,
		customLayerArns: null,
		diskSizeInMb: DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		enableLambdaInsights: false,
		indent: false,
		logLevel: 'info',
		providerSpecifics: mockImplementation,
		fullClientSpecifics: mockFullClientSpecifics,
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
		requestHandler: null,
	});

	expect(getMockCreateFunctionCalls()[0].customLayerArns).toBeNull();
});

test('Should be able to get the function afterwards', async () => {
	cleanFnStore();

	const {functionName} = await internalDeployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		customRoleArn: undefined,
		customLayerArns: null,
		diskSizeInMb: 10240,
		enableLambdaInsights: true,
		indent: false,
		logLevel: 'info',
		providerSpecifics: mockImplementation,
		fullClientSpecifics: mockFullClientSpecifics,
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
		requestHandler: null,
	});
	expect(functionName).toBe(
		speculateFunctionName({
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			diskSizeInMb: 10240,
		}),
	);
	const fns = await mockImplementation.getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: speculateFunctionName({
				memorySizeInMb: 2048,
				timeoutInSeconds: 120,
				diskSizeInMb: 10240,
			}),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: VERSION,
			diskSizeInMb: 10240,
		},
	]);
	markFunctionAsIncompatible(
		speculateFunctionName({
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			diskSizeInMb: 10240,
		}),
	);
	const compatibleFns = await mockImplementation.getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	const incompatibleFns = await mockImplementation.getFunctions({
		region: 'us-east-1',
		compatibleOnly: false,
	});
	expect(compatibleFns).toEqual([]);
	expect(incompatibleFns).toEqual([
		{
			functionName: speculateFunctionName({
				memorySizeInMb: 2048,
				timeoutInSeconds: 120,
				diskSizeInMb: 10240,
			}),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: '2021-06-23',
			diskSizeInMb: 10240,
		},
	]);
});
