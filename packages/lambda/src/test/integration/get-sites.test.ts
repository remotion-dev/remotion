import {internalGetOrCreateBucket} from '@remotion/serverless/client';
import {expect, test} from 'vitest';
import {internalDeploySite} from '../../api/deploy-site';
import {internalGetSites} from '../../api/get-sites';
import {mockImplementation} from '../mock-implementation';

test('Should have no buckets at first', async () => {
	expect(
		await internalGetSites({
			region: 'us-east-1',
			providerSpecifics: mockImplementation,
		}),
	).toEqual({buckets: [], sites: []});
});

test('Should have a site after deploying', async () => {
	await internalGetOrCreateBucket({
		region: 'eu-central-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: null,
	});
	expect(
		await internalDeploySite({
			bucketName: 'remotionlambda-eucentral1-abcdef',
			entryPoint: 'first',
			region: 'eu-central-1',
			siteName: 'testing',
			gitSource: null,
			logLevel: 'info',
			indent: false,
			providerSpecifics: mockImplementation,
			privacy: 'public',
			throwIfSiteExists: true,
			options: {},
		}),
	).toEqual({
		serveUrl:
			'https://remotionlambda-eucentral1-abcdef.s3.eu-central-1.amazonaws.com/sites/testing/index.html',
		siteName: 'testing',
		stats: {
			deletedFiles: 0,
			untouchedFiles: 0,
			uploadedFiles: 2,
		},
	});
	expect(
		await internalGetSites({
			region: 'eu-central-1',
			providerSpecifics: mockImplementation,
		}),
	).toEqual({
		buckets: [
			{
				creationDate: 0,
				name: 'remotionlambda-eucentral1-abcdef',
				region: 'eu-central-1',
			},
		],
		sites: [
			{
				bucketName: 'remotionlambda-eucentral1-abcdef',
				id: 'testing',
				lastModified: 0,
				sizeInBytes: 48,
				serveUrl:
					'https://remotionlambda-eucentral1-abcdef.s3.eu-central-1.amazonaws.com/sites/testing/index.html',
			},
		],
	});
});
