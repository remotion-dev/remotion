import {LambdaClientInternals} from '@remotion/lambda-client';
import {internalGetOrCreateBucket} from '@remotion/serverless';
import {expect, test} from 'bun:test';
import {internalDeploySite} from '../../api/deploy-site';
import {mockFullClientSpecifics} from '../mock-implementation';
import {mockImplementation} from '../mocks/mock-implementation';
import {resetMockStore} from '../mocks/mock-store';

test('Should have no buckets at first', async () => {
	resetMockStore();
	expect(
		await LambdaClientInternals.internalGetSites({
			region: 'us-east-1',
			providerSpecifics: mockImplementation,
			forcePathStyle: false,
			forceBucketName: null,
		}),
	).toEqual({buckets: [], sites: []});
});

test('Should have a site after deploying', async () => {
	resetMockStore();
	await internalGetOrCreateBucket({
		region: 'eu-central-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: null,
		forcePathStyle: false,
		skipPutAcl: false,
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
			forcePathStyle: false,
			fullClientSpecifics: mockFullClientSpecifics,
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
		await LambdaClientInternals.internalGetSites({
			region: 'eu-central-1',
			providerSpecifics: mockImplementation,
			forcePathStyle: false,
			forceBucketName: null,
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
