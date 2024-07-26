import {expect, test} from 'vitest';
import {deleteSite} from '../../api/delete-site';
import {deploySite, internalDeploySite} from '../../api/deploy-site';
import {getOrCreateBucket} from '../../api/get-or-create-bucket';
import {getDirFiles} from '../../api/upload-dir';
import {randomHash} from '../../shared/random-hash';
import {mockImplementation} from '../mock-implementation';

test('Should throw on wrong prefix', async () => {
	await expect(() =>
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
			siteName: randomHash(),
			throwIfSiteExists: true,
		}),
	).rejects.toThrow(/The bucketName parameter must start /);
});

test('Should throw if invalid region was passed', () => {
	expect(() =>
		internalDeploySite({
			bucketName: 'remotionlambda-testing',
			entryPoint: 'first',
			// @ts-expect-error
			region: 'ap-northeast-9',
			siteName: 'testing',
			gitSource: null,
			providerSpecifics: mockImplementation,
			indent: false,
			logLevel: 'info',
			options: {},
			privacy: 'public',
			throwIfSiteExists: true,
		}),
	).rejects.toThrow(/ap-northeast-9 is not a valid AWS region/);
});

test("Should throw if bucket doesn't exist", () => {
	expect(() =>
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
		}),
	).rejects.toThrow(
		/No bucket with the name remotionlambda-non-existed exists/,
	);
});

test('Should apply name if given', async () => {
	const {bucketName} = await getOrCreateBucket({
		region: 'ap-northeast-1',
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

test('Should use a random hash if no siteName is given', async () => {
	const {bucketName} = await getOrCreateBucket({
		region: 'ap-northeast-1',
	});
	expect(
		await deploySite({
			bucketName,
			entryPoint: 'first',
			region: 'ap-northeast-1',
			siteName: 'testing',
			gitSource: null,
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
	const {bucketName} = await getOrCreateBucket({
		region: 'ap-northeast-1',
	});

	await deploySite({
		bucketName,
		entryPoint: 'first',
		region: 'ap-northeast-1',
		siteName: 'testing',
		gitSource: null,
	});
	await deploySite({
		bucketName,
		entryPoint: 'second',
		region: 'ap-northeast-1',
		siteName: 'testing',
		gitSource: null,
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/testing',
		region: 'ap-northeast-1',
		continuationToken: undefined,
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
	const {bucketName} = await getOrCreateBucket({
		region: 'ap-northeast-1',
	});

	await deploySite({
		bucketName,
		entryPoint: 'first',
		region: 'ap-northeast-1',
		siteName: 'testing',
		gitSource: null,
	});
	await deploySite({
		bucketName,
		entryPoint: 'second',
		region: 'ap-northeast-1',
		siteName: 'testing-2',
		gitSource: null,
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/',
		region: 'ap-northeast-1',
		continuationToken: undefined,
	});

	await deleteSite({
		bucketName,
		region: 'ap-northeast-1',
		siteName: 'testing',
	});
	await deleteSite({
		bucketName,
		region: 'ap-northeast-1',
		siteName: 'testing-2',
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
});

test('Should not delete site with same prefix', async () => {
	const {bucketName} = await getOrCreateBucket({
		region: 'ap-northeast-1',
	});

	await deploySite({
		gitSource: null,
		bucketName,
		entryPoint: 'first',
		region: 'ap-northeast-1',
		siteName: 'my-site',
	});
	await deploySite({
		gitSource: null,
		bucketName,
		entryPoint: 'second',
		region: 'ap-northeast-1',
		siteName: 'my-site-staging',
	});
	await deploySite({
		gitSource: null,
		bucketName,
		entryPoint: 'first',
		region: 'ap-northeast-1',
		siteName: 'my-site',
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/',
		region: 'ap-northeast-1',
		continuationToken: undefined,
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
