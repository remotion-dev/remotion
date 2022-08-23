import {Internals} from 'remotion';
import {deleteFunction} from '../../api/delete-function';
import {deployFunction} from '../../api/deploy-function';
import {getFunctions} from '../../api/get-functions';
import {
	cleanFnStore,
	markFunctionAsIncompatible,
} from '../../api/mock-functions';
import {DEFAULT_EPHEMERAL_STORAGE_IN_MB} from '../../shared/constants';

const expectedFunctionName = (memory: number, timeout: number, disk: number) =>
	`remotion-render-${Internals.VERSION.replace(
		/\./g,
		'-'
	)}-mem${memory}mb-disk${disk}mb-${timeout}sec`;

test('Should be able to deploy function', async () => {
	const {functionName} = await deployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		architecture: 'arm64',
	});
	expect(functionName).toBe(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB)
	);
});

test('Should be able to get the function afterwards', async () => {
	cleanFnStore();

	const {functionName} = await deployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		architecture: 'arm64',
	});
	expect(functionName).toBe(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB)
	);
	const fns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: expectedFunctionName(
				2048,
				120,
				DEFAULT_EPHEMERAL_STORAGE_IN_MB
			),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: Internals.VERSION,
			region: 'us-east-1',
			diskSizeInMb: 2048,
		},
	]);
	const foreignFunctions = await getFunctions({
		region: 'us-east-2',
		compatibleOnly: true,
	});
	expect(foreignFunctions).toEqual([]);
});

test('Should be able to delete the function', async () => {
	cleanFnStore();

	const {functionName} = await deployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		architecture: 'arm64',
	});
	expect(functionName).toBe(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB)
	);
	await deleteFunction({
		region: 'us-east-1',
		functionName: expectedFunctionName(
			2048,
			120,
			DEFAULT_EPHEMERAL_STORAGE_IN_MB
		),
	});
	const fns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([]);
});

test('Should be able to get the function afterwards', async () => {
	cleanFnStore();

	const {functionName} = await deployFunction({
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
		createCloudWatchLogGroup: true,
		architecture: 'arm64',
	});
	expect(functionName).toBe(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB)
	);
	const fns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: expectedFunctionName(
				2048,
				120,
				DEFAULT_EPHEMERAL_STORAGE_IN_MB
			),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: Internals.VERSION,
			region: 'us-east-1',
			diskSizeInMb: 2048,
		},
	]);
	markFunctionAsIncompatible(
		expectedFunctionName(2048, 120, DEFAULT_EPHEMERAL_STORAGE_IN_MB)
	);
	const compatibleFns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	const incompatibleFns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: false,
	});
	expect(compatibleFns).toEqual([]);
	expect(incompatibleFns).toEqual([
		{
			functionName: expectedFunctionName(
				2048,
				120,
				DEFAULT_EPHEMERAL_STORAGE_IN_MB
			),
			memorySizeInMb: 2048,
			timeoutInSeconds: 120,
			version: '2021-06-23',
			region: 'us-east-1',
			diskSizeInMb: 2048,
		},
	]);
});
