import {afterEach, expect, spyOn, test} from 'bun:test';
import fs, {existsSync, mkdtempSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {BundleOptions} from '@remotion/bundler';
import {LambdaClientInternals} from '@remotion/lambda-client';
import {internalGetOrCreateBucket} from '@remotion/serverless';
import {internalDeleteSite} from '../../api/delete-site';
import {internalDeploySite} from '../../api/deploy-site';
import {mockFullClientSpecifics} from '../mock-implementation';
import {mockImplementation} from '../mocks/mock-implementation';
import {getDirFiles} from '../mocks/upload-dir';

const temporaryDirectories: string[] = [];

const makeGeneratedBundle = () => {
	const directory = mkdtempSync(
		path.join(os.tmpdir(), 'remotion-generated-bundle-test-'),
	);
	temporaryDirectories.push(directory);
	writeFileSync(path.join(directory, 'index.html'), '<html></html>');
	writeFileSync(path.join(directory, 'bundle.js'), 'console.log("bundle")');
	return directory;
};

const makeBucket = async () => {
	const {bucketName} = await internalGetOrCreateBucket({
		region: 'ap-northeast-1',
		providerSpecifics: mockImplementation,
		customCredentials: null,
		enableFolderExpiry: false,
		forcePathStyle: false,
		skipPutAcl: false,
		requestHandler: null,
		logLevel: 'error',
	});

	return bucketName;
};

const makeBundleSite = ({
	directory,
	getBundle,
	onStarted = () => undefined,
}: {
	directory: string;
	getBundle: () => Promise<string>;
	onStarted?: () => void;
}): typeof mockFullClientSpecifics.bundleSite => {
	return ((options: BundleOptions) => {
		options.onDirectoryCreated?.(directory);
		onStarted();
		return getBundle();
	}) as typeof mockFullClientSpecifics.bundleSite;
};

const deployGeneratedBundle = ({
	bucketName,
	fullClientSpecifics,
	providerSpecifics = mockImplementation,
	siteName,
}: {
	bucketName: string;
	fullClientSpecifics: typeof mockFullClientSpecifics;
	providerSpecifics?: typeof mockImplementation;
	siteName: string;
}) => {
	return internalDeploySite({
		bucketName,
		entryPoint: 'entry-point',
		region: 'ap-northeast-1',
		siteName,
		gitSource: null,
		providerSpecifics,
		indent: false,
		logLevel: 'error',
		options: {},
		privacy: 'public',
		throwIfSiteExists: false,
		forcePathStyle: false,
		fullClientSpecifics,
		requestHandler: null,
	});
};

const getRejection = <T>(promise: Promise<T>): Promise<unknown> => {
	return promise.then(
		() => {
			throw new Error('Expected the promise to reject');
		},
		(error: unknown) => error,
	);
};

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		fs.rmSync(directory, {force: true, recursive: true});
	}
});

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
			requestHandler: null,
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
			requestHandler: null,
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
		requestHandler: null,
		logLevel: 'info',
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
			requestHandler: null,
		}),
	).toEqual({
		siteName: 'testing',
		serveUrl:
			'https://remotionlambda-apnortheast1-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
		stats: {
			deletedFiles: 0,
			untouchedFiles: 0,
			uploadedFiles: 3,
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
		requestHandler: null,
		logLevel: 'info',
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
			requestHandler: null,
		}),
	).toEqual({
		siteName: 'testing',
		serveUrl:
			'https://remotionlambda-apnortheast1-abcdef.s3.ap-northeast-1.amazonaws.com/sites/testing/index.html',
		stats: {
			deletedFiles: 0,
			untouchedFiles: 3,
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
		requestHandler: null,
		logLevel: 'info',
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
		requestHandler: null,
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
		requestHandler: null,
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/testing',
		region: 'ap-northeast-1',
		continuationToken: undefined,
		forcePathStyle: false,
		requestHandler: null,
	});
	expect(
		files
			.map((f) => {
				return f.Key;
			})
			.sort(),
	).toEqual(
		getDirFiles('/path/to/bundle-2')
			.map((f) => {
				return 'sites/testing/' + f.name;
			})
			.sort(),
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
		requestHandler: null,
		logLevel: 'info',
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
		requestHandler: null,
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
		requestHandler: null,
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/',
		region: 'ap-northeast-1',
		continuationToken: undefined,
		forcePathStyle: false,
		requestHandler: null,
	});

	expect(
		files
			.map((f) => {
				return f.Key;
			})
			.sort(),
	).toEqual(
		[
			...getDirFiles('/path/to/bundle-1').map((f) => {
				return 'sites/testing/' + f.name;
			}),
			...getDirFiles('/path/to/bundle-2').map((f) => {
				return 'sites/testing-2/' + f.name;
			}),
		].sort(),
	);

	await internalDeleteSite({
		bucketName,
		region: 'ap-northeast-1',
		siteName: 'testing',
		providerSpecifics: mockImplementation,
		forcePathStyle: false,
		onAfterItemDeleted: null,
		requestHandler: null,
	});
	await internalDeleteSite({
		bucketName,
		region: 'ap-northeast-1',
		siteName: 'testing-2',
		providerSpecifics: mockImplementation,
		forcePathStyle: false,
		onAfterItemDeleted: null,
		requestHandler: null,
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
		requestHandler: null,
		logLevel: 'info',
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
		requestHandler: null,
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
		requestHandler: null,
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
		requestHandler: null,
	});

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/',
		region: 'ap-northeast-1',
		continuationToken: undefined,
		forcePathStyle: false,
		requestHandler: null,
	});
	expect(
		files
			.map((f) => {
				return f.Key;
			})
			.sort(),
	).toEqual(
		[
			// Should not delete my-site-staging (same bucket name but with suffix)
			...getDirFiles('/path/to/bundle-2').map((f) => {
				return 'sites/my-site-staging/' + f.name;
			}),
			...getDirFiles('/path/to/bundle-1').map((f) => {
				return 'sites/my-site/' + f.name;
			}),
		].sort(),
	);
});

test('Should remove a generated bundle after bundling fails', async () => {
	const directory = makeGeneratedBundle();
	const bucketName = await makeBucket();
	const bundlingError = new Error('Bundling failed');
	const fullClientSpecifics: typeof mockFullClientSpecifics = {
		...mockFullClientSpecifics,
		bundleSite: makeBundleSite({
			directory,
			getBundle: () => Promise.reject(bundlingError),
		}),
	};

	const error = await getRejection(
		deployGeneratedBundle({
			bucketName,
			fullClientSpecifics,
			siteName: 'bundling-failure',
		}),
	);

	expect(error).toBe(bundlingError);
	expect(existsSync(directory)).toBe(false);
});

test('Should wait for bundling to finish after listing fails', async () => {
	const directory = makeGeneratedBundle();
	const bucketName = await makeBucket();
	const listingError = new Error('Listing failed');
	let resolveBundle: (directory: string) => void = () => undefined;
	const bundlePromise = new Promise<string>((resolve) => {
		resolveBundle = resolve;
	});
	let markBundleStarted: () => void = () => undefined;
	const bundleStarted = new Promise<void>((resolve) => {
		markBundleStarted = resolve;
	});
	const fullClientSpecifics: typeof mockFullClientSpecifics = {
		...mockFullClientSpecifics,
		bundleSite: makeBundleSite({
			directory,
			getBundle: () => bundlePromise,
			onStarted: markBundleStarted,
		}),
	};
	const providerSpecifics: typeof mockImplementation = {
		...mockImplementation,
		listObjects: () => Promise.reject(listingError),
	};

	let settled = false;
	const observedDeployment = deployGeneratedBundle({
		bucketName,
		fullClientSpecifics,
		providerSpecifics,
		siteName: 'listing-failure',
	}).then(
		() => {
			settled = true;
			return null;
		},
		(reason: unknown) => {
			settled = true;
			return reason;
		},
	);

	await bundleStarted;
	await Promise.resolve();
	expect(settled).toBe(false);
	expect(existsSync(directory)).toBe(true);

	resolveBundle(directory);
	const error = await observedDeployment;
	expect(error).toBe(listingError);
	expect(existsSync(directory)).toBe(false);
});

test('Should remove a generated bundle after uploading fails', async () => {
	const directory = makeGeneratedBundle();
	const bucketName = await makeBucket();
	const uploadError = new Error('Uploading failed');
	const fullClientSpecifics: typeof mockFullClientSpecifics = {
		...mockFullClientSpecifics,
		bundleSite: makeBundleSite({
			directory,
			getBundle: () => Promise.resolve(directory),
		}),
		uploadDir: () => Promise.reject(uploadError),
	};

	const error = await getRejection(
		deployGeneratedBundle({
			bucketName,
			fullClientSpecifics,
			siteName: 'upload-failure',
		}),
	);

	expect(error).toBe(uploadError);
	expect(existsSync(directory)).toBe(false);
});

test('Should finish stale file deletions before removing the generated bundle', async () => {
	const directory = makeGeneratedBundle();
	const bucketName = await makeBucket();
	const deletionError = new Error('Deleting failed');
	let deleteCount = 0;
	let bundleWasRemovedDuringDeletion = false;
	const providerSpecifics: typeof mockImplementation = {
		...mockImplementation,
		listObjects: () => {
			return Promise.resolve(
				Array.from({length: 12}, (_, index) => ({
					Key: `sites/deletion-failure/stale-${index}.js`,
					ETag: 'stale-etag',
					LastModified: new Date(0),
					Size: 0,
				})),
			);
		},
		deleteFile: async () => {
			deleteCount++;
			if (!existsSync(directory)) {
				bundleWasRemovedDuringDeletion = true;
			}

			if (deleteCount === 1) {
				throw deletionError;
			}

			await new Promise((resolve) => setTimeout(resolve, 1));
			if (!existsSync(directory)) {
				bundleWasRemovedDuringDeletion = true;
			}
		},
	};
	const fullClientSpecifics: typeof mockFullClientSpecifics = {
		...mockFullClientSpecifics,
		bundleSite: makeBundleSite({
			directory,
			getBundle: () => Promise.resolve(directory),
		}),
		uploadDir: () => Promise.resolve(),
	};

	const error = await getRejection(
		deployGeneratedBundle({
			bucketName,
			fullClientSpecifics,
			providerSpecifics,
			siteName: 'deletion-failure',
		}),
	);

	expect(error).toBe(deletionError);
	expect(deleteCount).toBe(12);
	expect(bundleWasRemovedDuringDeletion).toBe(false);
	expect(existsSync(directory)).toBe(false);
});

test('Should remove a generated bundle after a successful deployment', async () => {
	const directory = makeGeneratedBundle();
	const bucketName = await makeBucket();
	const fullClientSpecifics: typeof mockFullClientSpecifics = {
		...mockFullClientSpecifics,
		bundleSite: makeBundleSite({
			directory,
			getBundle: () => Promise.resolve(directory),
		}),
	};

	const result = await deployGeneratedBundle({
		bucketName,
		fullClientSpecifics,
		siteName: 'successful-cleanup',
	});

	expect(result.stats.uploadedFiles).toBe(2);
	expect(existsSync(directory)).toBe(false);
});

test('Should report a cleanup failure after a successful deployment', async () => {
	const directory = makeGeneratedBundle();
	const bucketName = await makeBucket();
	const cleanupError = new Error('Cleanup failed');
	const fullClientSpecifics: typeof mockFullClientSpecifics = {
		...mockFullClientSpecifics,
		bundleSite: makeBundleSite({
			directory,
			getBundle: () => Promise.resolve(directory),
		}),
	};
	const cleanupSpy = spyOn(fs, 'rmSync').mockImplementation(() => {
		throw cleanupError;
	});

	let error: unknown;
	try {
		error = await getRejection(
			deployGeneratedBundle({
				bucketName,
				fullClientSpecifics,
				siteName: 'cleanup-failure',
			}),
		);
	} finally {
		cleanupSpy.mockRestore();
	}

	expect(error).toBe(cleanupError);
	expect(existsSync(directory)).toBe(true);
});

test('Should retain deployment and cleanup errors if both fail', async () => {
	const directory = makeGeneratedBundle();
	const bucketName = await makeBucket();
	const deploymentError = new Error('Deployment failed');
	const cleanupError = new Error('Cleanup failed');
	const fullClientSpecifics: typeof mockFullClientSpecifics = {
		...mockFullClientSpecifics,
		bundleSite: makeBundleSite({
			directory,
			getBundle: () => Promise.resolve(directory),
		}),
		uploadDir: () => Promise.reject(deploymentError),
	};
	const cleanupSpy = spyOn(fs, 'rmSync').mockImplementation(() => {
		throw cleanupError;
	});

	let error: unknown;
	try {
		error = await getRejection(
			deployGeneratedBundle({
				bucketName,
				fullClientSpecifics,
				siteName: 'deployment-and-cleanup-failure',
			}),
		);
	} finally {
		cleanupSpy.mockRestore();
	}

	expect(error).toBeInstanceOf(AggregateError);
	expect((error as AggregateError).errors).toEqual([
		deploymentError,
		cleanupError,
	]);
	expect((error as AggregateError).cause).toBe(deploymentError);
	expect(existsSync(directory)).toBe(true);
});
