import {LambdaClientInternals} from '@remotion/lambda-client';
import {internalGetOrCreateBucket} from '@remotion/serverless';
import {expect, test} from 'bun:test';
import {internalDeleteSite} from '../../api/delete-site';
import {internalDeploySite} from '../../api/deploy-site';
import {mockFullClientSpecifics} from '../mock-implementation';
import {mockImplementation} from '../mocks/mock-implementation';
import {getDirFiles} from '../mocks/upload-dir';

test('Should throw on wrong prefix', async () => {
	await expect(
		internalDeploySite({
			bucketName: 'wrongprefix',
			entryPoint: 'first',
			region: 'us-east-1',
			gitSource: null,
			providerSpecifics: mockImplementation,
			indent: false,
			logLevel: 'info',
			options: {},
			privacy: 'public',
			siteName: mockImplementation.randomHash(),
			throwIfSiteExists: true,
			forcePathStyle: false,
			fullClientSpecifics: mockFullClientSpecifics,
		}),
	).rejects.toThrow(/The bucketName parameter must start /);
});

test('Should throw if invalid region was passed', () => {
	expect(
		internalDeploySite({
			bucketName: 'remotionlambda-testing',
			entryPoint: 'first',
			// @ts-expect-error
			region: 'ap-northeast-9',
			siteName: 'testing',
			gitSource: null,
			providerSpecifics: LambdaClientInternals.awsImplementation,
			indent: false,
			logLevel: 'info',
			options: {},
			privacy: 'public',
			throwIfSiteExists: true,
			forcePathStyle: false,
			fullClientSpecifics: mockFullClientSpecifics,
		}),
	).rejects.toThrow(/ap-northeast-9 is not a supported AWS region/);
});

test("Should throw if bucket doesn't exist", () => {
	expect(
		internalDeploySite({
			bucketName: 'remotionlambda-non-existed',
			entryPoint: 'first',
			region: 'ap-northeast-1',
			siteName: 'testing',
			gitSource: null,
			providerSpecifics: mockImplementation,
			indent: false,
			logLevel: 'info',
			options: {},
			privacy: 'public',
			throwIfSiteExists: true,
			forcePathStyle: false,
			fullClientSpecifics: mockFullClientSpecifics,
		}),
	).rejects.toThrow(
		/No bucket with the name remotionlambda-non-existed exists/,
	);
});

test('Should apply name if given', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'ap-northeast-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: false,
		forcePathStyle: false,
		skipPutAcl: false,
	});
	expect(
		await internalDeploySite({
			bucketName,
			entryPoint: 'first',
			region: 'ap-northeast-1',
			siteName: 'testing',
			gitSource: null,
			indent: false,
			logLevel: 'info',
			options: {},
			privacy: 'public',
			throwIfSiteExists: true,
			providerSpecifics: mockImplementation,
			forcePathStyle: false,
			fullClientSpecifics: mockFullClientSpecifics,
		}),
	).toEqual({
		siteName: 'testing',
		serveUrl:
			'https://remotionlambda-apnortheast1-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
		stats: {
			deletedFiles: 0,
			untouchedFiles: 0,
			uploadedFiles: 2,
		},
	});
});

test('Should overwrite site if given siteName is already taken', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'ap-northeast-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: false,
		forcePathStyle: false,
		skipPutAcl: false,
	});

	expect(
		await internalDeploySite({
			bucketName,
			entryPoint: 'first',
			region: 'ap-northeast-1',
			siteName: 'testing',
			gitSource: null,
			providerSpecifics: mockImplementation,
			indent: false,
			logLevel: 'info',
			options: {},
			privacy: 'public',
			throwIfSiteExists: false,
			forcePathStyle: false,
			fullClientSpecifics: mockFullClientSpecifics,
		}),
	).toEqual({
		siteName: 'testing',
		serveUrl:
			'https://remotionlambda-apnortheast1-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
		stats: {
			deletedFiles: 0,
			untouchedFiles: 2,
			uploadedFiles: 0,
		},
	});
});

test('Should delete the previous site if deploying the new one', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'ap-northeast-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: false,
		forcePathStyle: false,
		skipPutAcl: false,
	});

	await internalDeploySite({
		bucketName,
		entryPoint: 'first',
		region: 'ap-northeast-1',
		siteName: 'testing',
		gitSource: null,
		providerSpecifics: mockImplementation,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		forcePathStyle: false,
		fullClientSpecifics: mockFullClientSpecifics,
	});
	await internalDeploySite({
		bucketName,
		entryPoint: 'second',
		region: 'ap-northeast-1',
		siteName: 'testing',
		gitSource: null,
		providerSpecifics: mockImplementation,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		forcePathStyle: false,
		fullClientSpecifics: mockFullClientSpecifics,
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/testing',
		region: 'ap-northeast-1',
		continuationToken: undefined,
		forcePathStyle: false,
	});
	expect(
		files.map((f) => {
			return f.Key;
		}),
	).toEqual(
		getDirFiles('/path/to/bundle-2').map((f) => {
			return 'sites/testing/' + f.name;
		}),
	);
});

test('Should keep the previous site if deploying the new one with different ID', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'ap-northeast-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: false,
		forcePathStyle: false,
		skipPutAcl: false,
	});

	await internalDeploySite({
		bucketName,
		entryPoint: 'first',
		region: 'ap-northeast-1',
		siteName: 'testing',
		gitSource: null,
		providerSpecifics: mockImplementation,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		forcePathStyle: false,
		fullClientSpecifics: mockFullClientSpecifics,
	});
	await internalDeploySite({
		bucketName,
		entryPoint: 'second',
		region: 'ap-northeast-1',
		siteName: 'testing-2',
		gitSource: null,
		providerSpecifics: mockImplementation,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		forcePathStyle: false,
		fullClientSpecifics: mockFullClientSpecifics,
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/',
		region: 'ap-northeast-1',
		continuationToken: undefined,
		forcePathStyle: false,
	});

	expect(
		files.map((f) => {
			return f.Key;
		}),
	).toEqual([
		...getDirFiles('/path/to/bundle-1').map((f) => {
			return 'sites/testing/' + f.name;
		}),
		...getDirFiles('/path/to/bundle-2').map((f) => {
			return 'sites/testing-2/' + f.name;
		}),
	]);

	await internalDeleteSite({
		bucketName,
		region: 'ap-northeast-1',
		siteName: 'testing',
		providerSpecifics: mockImplementation,
		forcePathStyle: false,
		onAfterItemDeleted: null,
	});
	await internalDeleteSite({
		bucketName,
		region: 'ap-northeast-1',
		siteName: 'testing-2',
		providerSpecifics: mockImplementation,
		forcePathStyle: false,
		onAfterItemDeleted: null,
	});
});

test('Should not delete site with same prefix', async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'ap-northeast-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: false,
		forcePathStyle: false,
		skipPutAcl: false,
	});

	await internalDeploySite({
		gitSource: null,
		bucketName,
		entryPoint: 'first',
		region: 'ap-northeast-1',
		siteName: 'my-site',
		providerSpecifics: mockImplementation,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		forcePathStyle: false,
		fullClientSpecifics: mockFullClientSpecifics,
	});
	await internalDeploySite({
		gitSource: null,
		bucketName,
		entryPoint: 'second',
		region: 'ap-northeast-1',
		siteName: 'my-site-staging',
		providerSpecifics: mockImplementation,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		forcePathStyle: false,
		fullClientSpecifics: mockFullClientSpecifics,
	});
	await internalDeploySite({
		gitSource: null,
		bucketName,
		entryPoint: 'first',
		region: 'ap-northeast-1',
		siteName: 'my-site',
		providerSpecifics: mockImplementation,
		indent: false,
		logLevel: 'info',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		forcePathStyle: false,
		fullClientSpecifics: mockFullClientSpecifics,
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/',
		region: 'ap-northeast-1',
		continuationToken: undefined,
		forcePathStyle: false,
	});
	expect(
		files.map((f) => {
			return f.Key;
		}),
	).toEqual([
		// Should not delete my-site-staging (same bucket name but with suffix)
		...getDirFiles('/path/to/bundle-2').map((f) => {
			return 'sites/my-site-staging/' + f.name;
		}),
		...getDirFiles('/path/to/bundle-1').map((f) => {
			return 'sites/my-site/' + f.name;
		}),
	]);
});
