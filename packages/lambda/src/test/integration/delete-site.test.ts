import {internalGetOrCreateBucket} from '@remotion/serverless';
import {expect, test} from 'bun:test';
import {internalDeleteSite} from '../../api/delete-site';
import {internalDeploySite} from '../../api/deploy-site';
import {mockFullClientSpecifics} from '../mock-implementation';
import {mockImplementation} from '../mocks/mock-implementation';

test('Return 0 total size if site did not exist', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'eu-west-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: null,
		forcePathStyle: false,
		skipPutAcl: false,
		requestHandler: null,
	});
	expect(
		await internalDeleteSite({
			bucketName,
			region: 'eu-west-1',
			siteName: 'non existent',
			providerSpecifics: mockImplementation,
			forcePathStyle: false,
			onAfterItemDeleted: null,
			requestHandler: null,
		}),
	).toEqual({totalSizeInBytes: 0});
});
test('Return more than 0 total size if site did not exist', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'eu-west-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: null,
		forcePathStyle: false,
		skipPutAcl: false,
		requestHandler: null,
	});
	const {siteName} = await internalDeploySite({
		bucketName,
		entryPoint: 'first',
		region: 'eu-west-1',
		gitSource: null,
		providerSpecifics: mockImplementation,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		siteName: mockImplementation.randomHash(),
		forcePathStyle: false,
		fullClientSpecifics: mockFullClientSpecifics,
		requestHandler: null,
	});
	expect(
		(
			await internalDeleteSite({
				bucketName,
				region: 'eu-west-1',
				siteName,
				providerSpecifics: mockImplementation,
				forcePathStyle: false,
				onAfterItemDeleted: null,
				requestHandler: null,
			})
		).totalSizeInBytes,
	).toBeGreaterThan(0);
});
