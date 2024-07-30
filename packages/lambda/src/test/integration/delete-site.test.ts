import {internalGetOrCreateBucket} from '@remotion/serverless/client';
import {expect, test} from 'vitest';
import {internalDeleteSite} from '../../api/delete-site';
import {internalDeploySite} from '../../api/deploy-site';
import {mockImplementation} from '../mock-implementation';

test('Return 0 total size if site did not exist', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'eu-west-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: null,
	});
	expect(
		await internalDeleteSite({
			bucketName,
			region: 'eu-west-1',
			siteName: 'non existent',
			providerSpecifics: mockImplementation,
		}),
	).toEqual({totalSizeInBytes: 0});
});
test('Return more than 0 total size if site did not exist', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'eu-west-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: null,
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
	});
	expect(
		(
			await internalDeleteSite({
				bucketName,
				region: 'eu-west-1',
				siteName,
				providerSpecifics: mockImplementation,
			})
		).totalSizeInBytes,
	).toBeGreaterThan(0);
});
