import {deployFunction} from '../../api/deploy-function';
import {ensureLambdaBinaries} from '../../api/ensure-lambda-binaries';

jest.mock('../../api/get-buckets');
jest.mock('../../functions/helpers/io');
jest.mock('../../shared/bundle-site');
jest.mock('../../shared/random-hash');
jest.mock('../../api/enable-s3-website');
jest.mock('../../api/create-bucket');
jest.mock('../../api/upload-dir');
jest.mock('../../api/bucket-exists');
jest.mock('../../api/clean-items');
jest.mock('../../api/deploy-function');
jest.mock('../../api/ensure-lambda-binaries');

test('Should be able to deploy function', async () => {
	const {layerArn} = await ensureLambdaBinaries('us-east-1');

	const {functionName} = await deployFunction({
		layerArn,
		memorySizeInMb: 2048,
		region: 'us-east-1',
		timeoutInSeconds: 120,
	});
	expect(functionName).toBe('hithere');
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
