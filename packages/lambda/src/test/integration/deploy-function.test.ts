import {
	LambdaClientInternals,
	speculateFunctionName,
} from '@remotion/lambda-client';
import {expect, test} from 'bun:test';
import {VERSION} from 'remotion/version';
import {internalDeployFunction} from '../../api/deploy-function';
import {mockFullClientSpecifics} from '../mock-implementation';
import {
	cleanFnStore,
	markFunctionAsIncompatible,
} from '../mocks/mock-functions';
import {mockImplementation} from '../mocks/mock-implementation';

const {DEFAULT_EPHEMERAL_STORAGE_IN_MB} = LambdaClientInternals;

test('Should be able to deploy function', async () => {
	const {functionName} = await internalDeployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		customRoleArn: undefined,
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

test('Should be able to get the function afterwards', async () => {
	cleanFnStore();

	const {functionName} = await internalDeployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		customRoleArn: undefined,
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
