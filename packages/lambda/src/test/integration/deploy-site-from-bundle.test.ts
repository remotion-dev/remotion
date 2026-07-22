import {afterEach, expect, test} from 'bun:test';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {internalGetOrCreateBucket} from '@remotion/serverless';
import {VERSION} from 'remotion/version';
import {internalDeploySiteFromBundle} from '../../api/deploy-site-from-bundle';
import {mockFullClientSpecifics} from '../mock-implementation';
import {mockImplementation} from '../mocks/mock-implementation';
import {resetMockStore} from '../mocks/mock-store';

const temporaryDirectories: string[] = [];

const relocatableIndexHtml = `<!DOCTYPE html>
<html>
<head></head>
<body>
<script>window.remotion_publicPath = "./";</script>
<script>window.siteVersion = '11'; window.remotion_version = '${VERSION}';</script>
</body>
</html>`;

const makeBundle = (files: Record<string, string>) => {
	const bundleDir = mkdtempSync(
		path.join(os.tmpdir(), 'remotion-bundle-test-'),
	);
	temporaryDirectories.push(bundleDir);
	writeFileSync(path.join(bundleDir, 'index.html'), relocatableIndexHtml);

	for (const [file, contents] of Object.entries(files)) {
		const filePath = path.join(bundleDir, file);
		mkdirSync(path.dirname(filePath), {recursive: true});
		writeFileSync(filePath, contents);
	}

	return bundleDir;
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

const deployBundle = ({
	bucketName,
	bundleDir,
	siteName,
	throwIfSiteExists = false,
	providerSpecifics = mockImplementation,
	fullClientSpecifics = mockFullClientSpecifics,
}: {
	bucketName: string;
	bundleDir: string;
	siteName: string;
	throwIfSiteExists?: boolean;
	providerSpecifics?: typeof mockImplementation;
	fullClientSpecifics?: typeof mockFullClientSpecifics;
}) => {
	return internalDeploySiteFromBundle({
		bucketName,
		bundleDir,
		region: 'ap-northeast-1',
		siteName,
		providerSpecifics,
		indent: false,
		logLevel: 'error',
		options: {},
		privacy: 'public',
		throwIfSiteExists,
		forcePathStyle: false,
		fullClientSpecifics,
		requestHandler: null,
	});
};

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		rmSync(directory, {recursive: true, force: true});
	}

	resetMockStore();
});

test('deploys a caller-owned bundle without invoking the bundler', async () => {
	const bundleDir = makeBundle({
		'bundle.js': 'console.log("bundle")',
		'assets/chunk.js': 'console.log("chunk")',
	});
	const bundleBefore = readFileSync(path.join(bundleDir, 'index.html'));
	const bucketName = await makeBucket();

	const fullClientSpecifics = {
		...mockFullClientSpecifics,
		bundleSite: () => {
			throw new Error('The bundler must not be called');
		},
	};

	const result = await deployBundle({
		bucketName,
		bundleDir,
		siteName: 'from-bundle-basic',
		fullClientSpecifics,
	});

	expect(result).toEqual({
		serveUrl:
			'https://remotionlambda-apnortheast1-abcdef.s3.ap-northeast-1.amazonaws.com/sites/from-bundle-basic/index.html',
		siteName: 'from-bundle-basic',
		stats: {
			deletedFiles: 0,
			untouchedFiles: 0,
			uploadedFiles: 3,
		},
	});
	expect(existsSync(bundleDir)).toBe(true);
	expect(readFileSync(path.join(bundleDir, 'index.html'))).toEqual(
		bundleBefore,
	);

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/from-bundle-basic/',
		region: 'ap-northeast-1',
		continuationToken: undefined,
		forcePathStyle: false,
		requestHandler: null,
	});
	expect(files.map((file) => file.Key).sort()).toEqual([
		'sites/from-bundle-basic/assets/chunk.js',
		'sites/from-bundle-basic/bundle.js',
		'sites/from-bundle-basic/index.html',
	]);
});

test('incrementally uploads and deletes files without deleting either bundle', async () => {
	const firstBundle = makeBundle({
		'bundle.js': 'first',
		'stale.js': 'stale',
	});
	const secondBundle = makeBundle({
		'bundle.js': 'second',
		'new.js': 'new',
	});
	const bucketName = await makeBucket();

	await deployBundle({
		bucketName,
		bundleDir: firstBundle,
		siteName: 'from-bundle-incremental',
	});
	const result = await deployBundle({
		bucketName,
		bundleDir: secondBundle,
		siteName: 'from-bundle-incremental',
	});

	expect(result.stats).toEqual({
		deletedFiles: 1,
		untouchedFiles: 2,
		uploadedFiles: 1,
	});
	expect(existsSync(firstBundle)).toBe(true);
	expect(existsSync(secondBundle)).toBe(true);

	const files = await mockImplementation.listObjects({
		bucketName,
		expectedBucketOwner: null,
		prefix: 'sites/from-bundle-incremental/',
		region: 'ap-northeast-1',
		continuationToken: undefined,
		forcePathStyle: false,
		requestHandler: null,
	});
	expect(files.map((file) => file.Key).sort()).toEqual([
		'sites/from-bundle-incremental/bundle.js',
		'sites/from-bundle-incremental/index.html',
		'sites/from-bundle-incremental/new.js',
	]);
});

test('keeps the caller bundle when deployment fails', async () => {
	const bundleDir = makeBundle({'bundle.js': 'bundle'});
	const bucketName = await makeBucket();
	const fullClientSpecifics = {
		...mockFullClientSpecifics,
		uploadDir: () => Promise.reject(new Error('Upload failed')),
	};

	await expect(
		deployBundle({
			bucketName,
			bundleDir,
			siteName: 'from-bundle-failure',
			fullClientSpecifics,
		}),
	).rejects.toThrow('Upload failed');
	expect(existsSync(bundleDir)).toBe(true);
});

test('supports throwIfSiteExists without deleting the caller bundle', async () => {
	const firstBundle = makeBundle({'bundle.js': 'first'});
	const secondBundle = makeBundle({'bundle.js': 'second'});
	const bucketName = await makeBucket();

	await deployBundle({
		bucketName,
		bundleDir: firstBundle,
		siteName: 'from-bundle-existing',
	});
	await expect(
		deployBundle({
			bucketName,
			bundleDir: secondBundle,
			siteName: 'from-bundle-existing',
			throwIfSiteExists: true,
		}),
	).rejects.toThrow('there are already files in this folder');
	expect(existsSync(secondBundle)).toBe(true);
});

test('validates the local bundle before making an AWS request', async () => {
	let awsCalls = 0;
	const providerSpecifics: typeof mockImplementation = {
		...mockImplementation,
		getAccountId: () => {
			awsCalls++;
			return Promise.resolve('123456789');
		},
	};
	const missingPathParent = mkdtempSync(
		path.join(os.tmpdir(), 'missing-remotion-bundle-test-'),
	);
	temporaryDirectories.push(missingPathParent);
	const missingPath = path.join(missingPathParent, 'missing');

	await expect(
		deployBundle({
			bucketName: 'remotionlambda-testing',
			bundleDir: missingPath,
			siteName: 'from-bundle-validation',
			providerSpecifics,
		}),
	).rejects.toThrow('does not exist');
	expect(awsCalls).toBe(0);

	const filePath = path.join(
		mkdtempSync(path.join(os.tmpdir(), 'remotion-bundle-file-test-')),
		'bundle',
	);
	temporaryDirectories.push(path.dirname(filePath));
	writeFileSync(filePath, 'not a directory');
	await expect(
		deployBundle({
			bucketName: 'remotionlambda-testing',
			bundleDir: filePath,
			siteName: 'from-bundle-validation',
			providerSpecifics,
		}),
	).rejects.toThrow('is not a directory');

	const withoutIndex = makeBundle({});
	rmSync(path.join(withoutIndex, 'index.html'));
	await expect(
		deployBundle({
			bucketName: 'remotionlambda-testing',
			bundleDir: withoutIndex,
			siteName: 'from-bundle-validation',
			providerSpecifics,
		}),
	).rejects.toThrow('does not contain an index.html');

	const withoutBundleScript = makeBundle({});
	await expect(
		deployBundle({
			bucketName: 'remotionlambda-testing',
			bundleDir: withoutBundleScript,
			siteName: 'from-bundle-validation',
			providerSpecifics,
		}),
	).rejects.toThrow('does not contain a bundle.js');

	const incompatible = makeBundle({'bundle.js': 'bundle'});
	writeFileSync(
		path.join(incompatible, 'index.html'),
		'<script>window.remotion_publicPath = "/";</script>',
	);
	await expect(
		deployBundle({
			bucketName: 'remotionlambda-testing',
			bundleDir: incompatible,
			siteName: 'from-bundle-validation',
			providerSpecifics,
		}),
	).rejects.toThrow('is not relocatable');

	const malformedPublicPath = makeBundle({'bundle.js': 'bundle'});
	writeFileSync(
		path.join(malformedPublicPath, 'index.html'),
		'<script>window.remotion_publicPath = "\\x";</script>',
	);
	await expect(
		deployBundle({
			bucketName: 'remotionlambda-testing',
			bundleDir: malformedPublicPath,
			siteName: 'from-bundle-validation',
			providerSpecifics,
		}),
	).rejects.toMatchObject({
		message: expect.stringContaining(
			'Could not parse `window.remotion_publicPath`',
		),
		cause: expect.any(SyntaxError),
	});
	expect(awsCalls).toBe(0);
});

if (process.platform !== 'win32') {
	test('uploads file symlinks and rejects directory symlinks before AWS requests', async () => {
		const externalDirectory = mkdtempSync(
			path.join(os.tmpdir(), 'remotion-symlink-target-test-'),
		);
		temporaryDirectories.push(externalDirectory);
		const externalFile = path.join(externalDirectory, 'target.txt');
		writeFileSync(externalFile, 'linked contents');

		const fileLinkBundle = makeBundle({'bundle.js': 'bundle'});
		symlinkSync(externalFile, path.join(fileLinkBundle, 'linked.txt'));
		const bucketName = await makeBucket();
		const result = await deployBundle({
			bucketName,
			bundleDir: fileLinkBundle,
			siteName: 'from-bundle-file-link',
		});
		expect(result.stats.uploadedFiles).toBe(3);

		const directoryLinkBundle = makeBundle({'bundle.js': 'bundle'});
		symlinkSync(
			externalDirectory,
			path.join(directoryLinkBundle, 'linked-directory'),
			'dir',
		);
		let awsCalls = 0;
		const providerSpecifics: typeof mockImplementation = {
			...mockImplementation,
			getAccountId: () => {
				awsCalls++;
				return Promise.resolve('123456789');
			},
		};
		await expect(
			deployBundle({
				bucketName,
				bundleDir: directoryLinkBundle,
				siteName: 'from-bundle-directory-link',
				providerSpecifics,
			}),
		).rejects.toThrow('symbolic link to a directory');
		expect(awsCalls).toBe(0);
	});
}
