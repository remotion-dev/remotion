import {VERSION} from 'remotion/version';
import {expect, test} from 'vitest';
import {internalDeployFunction} from '../../api/deploy-function';
import {
	cleanFnStore,
	markFunctionAsIncompatible,
} from '../../api/mock-functions';
import {DEFAULT_EPHEMERAL_STORAGE_IN_MB} from '../../shared/constants';
import {LAMBDA_VERSION_STRING} from '../../shared/lambda-version-string';
import {mockImplementation} from '../mock-implementation';

const expectedFunctionName = (memory: number, timeout: number, disk: number) =>
	`remotion-render-${LAMBDA_VERSION_STRING}-mem${memory}mb-disk${disk}mb-${timeout}sec`;

test('Should be able to deploy function', async () => {
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
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
	});
	expect(functionName).toBe(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB),
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
		diskSizeInMb: 10240,
		enableLambdaInsights: true,
		indent: false,
		logLevel: 'info',
		providerSpecifics: mockImplementation,
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
	});
	expect(functionName).toBe(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB),
	);
	const fns = await mockImplementation.getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: expectedFunctionName(
				2048,
				120,
				DEFAULT_EPHEMERAL_STORAGE_IN_MB,
			),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: VERSION,
			region: 'us-east-1',
			diskSizeInMb: 2048,
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
		diskSizeInMb: 10240,
		enableLambdaInsights: true,
		indent: false,
		logLevel: 'info',
		providerSpecifics: mockImplementation,
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
	});
	expect(functionName).toBe(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB),
	);
	mockImplementation.deleteFunction({
		region: 'us-east-1',
		functionName: expectedFunctionName(
			2048,
			120,
			DEFAULT_EPHEMERAL_STORAGE_IN_MB,
		),
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
		runtimePreference: 'default',
		vpcSecurityGroupIds: undefined,
		vpcSubnetIds: undefined,
		cloudWatchLogRetentionPeriodInDays: undefined,
	});
	expect(functionName).toBe(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB),
	);
	const fns = await mockImplementation.getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: expectedFunctionName(
				2048,
				120,
				DEFAULT_EPHEMERAL_STORAGE_IN_MB,
			),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: VERSION,
			region: 'us-east-1',
			diskSizeInMb: 2048,
		},
	]);
	markFunctionAsIncompatible(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB),
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
			functionName: expectedFunctionName(
				2048,
				120,
				DEFAULT_EPHEMERAL_STORAGE_IN_MB,
			),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: '2021-06-23',
			region: 'us-east-1',
			diskSizeInMb: 2048,
		},
	]);
});
