import {deployFunction} from '../../api/deploy-function';
import {ensureLambdaBinaries} from '../../api/ensure-lambda-binaries';
import {getFunctions} from '../../api/get-functions';
import {cleanFnStore} from '../../api/mock-functions';

jest.mock('../../api/get-buckets');
jest.mock('../../functions/helpers/io');
jest.mock('../../shared/bundle-site');
jest.mock('../../shared/random-hash');
jest.mock('../../api/enable-s3-website');
jest.mock('../../api/create-bucket');
jest.mock('../../api/upload-dir');
jest.mock('../../api/bucket-exists');
jest.mock('../../api/clean-items');
jest.mock('../../api/ensure-lambda-binaries');
jest.mock('../../api/create-function');
jest.mock('../../api/bundle-lambda');
jest.mock('../../api/get-functions');
jest.mock('../../shared/get-account-id');

test('Should be able to deploy function', async () => {
	const {layerArn} = await ensureLambdaBinaries('us-east-1');

	const {functionName} = await deployFunction({
		layerArn,
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
	});
	expect(functionName).toBe('remotion-render-abcdef');
});

test('Should not be able to deploy function if binaries were not ensured', async () => {
	await expect(() =>
		deployFunction({
			layerArn: 'us-east-2',
			memorySizeInMb: 2048,
			region: 'us-east-2',
			timeoutInSeconds: 120,
		})
	).rejects.toThrow(/did not ensure layer for/);
});

test('Should be able to get the function afterwards', async () => {
	cleanFnStore();
	const {layerArn} = await ensureLambdaBinaries('us-east-1');

	const {functionName} = await deployFunction({
		layerArn,
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
	});
	expect(functionName).toBe('remotion-render-abcdef');
	const fns = await getFunctions({
		region: 'us-east-1',
		compatibleOnly: true,
	});
	expect(fns).toEqual([
		{
			functionName: 'remotion-render-abcdef',
			memorySizeInMb: 1024,
			timeoutInSeconds: 120,
			version: '2021-09-15',
		},
	]);
});
