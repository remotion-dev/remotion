import {expect, test} from 'bun:test';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {internalDeleteSite} from '../../api/delete-site';
import {internalDeploySite} from '../../api/deploy-site';
import {useFakeAws} from '../mocks/fake-aws';

useFakeAws();

test('Return 0 total size if site did not exist', async () => {
	const {bucketName} = await LambdaClientInternals.internalGetOrCreateBucket({
		region: 'eu-west-1',
		customCredentials: null,
		enableFolderExpiry: null,
		forcePathStyle: false,
		skipPutAcl: false,
		requestHandler: null,
		logLevel: 'info',
	});
	expect(
		await internalDeleteSite({
			bucketName,
			region: 'eu-west-1',
			siteName: 'non existent',
			forcePathStyle: false,
			onAfterItemDeleted: null,
			requestHandler: null,
		}),
	).toEqual({totalSizeInBytes: 0});
});
test('Return more than 0 total size if site did not exist', async () => {
	const {bucketName} = await LambdaClientInternals.internalGetOrCreateBucket({
		region: 'eu-west-1',
		customCredentials: null,
		enableFolderExpiry: null,
		forcePathStyle: false,
		skipPutAcl: false,
		requestHandler: null,
		logLevel: 'info',
	});
	const {siteName} = await internalDeploySite({
		bucketName,
		entryPoint: 'first',
		region: 'eu-west-1',
		gitSource: null,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		siteName: LambdaClientInternals.randomHashImplementation(),
		forcePathStyle: false,
		requestHandler: null,
	});
	expect(
		(
			await internalDeleteSite({
				bucketName,
				region: 'eu-west-1',
				siteName,
				forcePathStyle: false,
				onAfterItemDeleted: null,
				requestHandler: null,
			})
		).totalSizeInBytes,
	).toBeGreaterThan(0);
});
