import {
	LambdaClientInternals,
	type AwsRegion,
	type RequestHandler,
} from '@remotion/lambda-client';
import {
	getSitesKey,
	REMOTION_BUCKET_PREFIX,
} from '@remotion/lambda-client/constants';
import {uploadDir} from '../api/upload-dir';
import type {UploadDirProgress} from '../functions/types';
import {getS3DiffOperations} from './get-s3-operations';
import {validateSiteName} from './validate-site-name';
import {waitForPromisesToFinish} from './wait-for-promises-to-finish';

export type DeploySiteOutput = Promise<{
	serveUrl: string;
	siteName: string;
	stats: {
		uploadedFiles: number;
		deletedFiles: number;
		untouchedFiles: number;
	};
}>;

export type DeploySiteWithBundleOptions = {
	onUploadProgress?: (upload: UploadDirProgress) => void;
	onDiffingProgress?: (bytes: number, done: boolean) => void;
	bypassBucketNameValidation?: boolean;
};

export type DeploySiteWithBundleInput = {
	bucketName: string;
	region: AwsRegion;
	siteName: string;
	options: DeploySiteWithBundleOptions;
	privacy: 'public' | 'no-acl';
	throwIfSiteExists: boolean;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
	getBundle: () => Promise<string>;
};

const deleteConcurrency = 10;

export const deploySiteWithBundle: (
	input: DeploySiteWithBundleInput,
) => DeploySiteOutput = async ({
	bucketName,
	region,
	siteName,
	options,
	privacy,
	throwIfSiteExists,
	forcePathStyle,
	requestHandler,
	getBundle,
}) => {
	LambdaClientInternals.validateAwsRegion(region);
	LambdaClientInternals.validateBucketName({
		bucketName,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
		options: {
			mustStartWithRemotion: !options.bypassBucketNameValidation,
		},
	});

	validateSiteName(siteName);
	LambdaClientInternals.validatePrivacy(privacy, false);

	const accountId = await LambdaClientInternals.getAccountIdImplementation({
		region,
	});

	const bucketExists =
		await LambdaClientInternals.bucketExistsInRegionImplementation({
			bucketName,
			region,
			expectedBucketOwner: accountId,
			forcePathStyle,
			requestHandler,
		});
	if (!bucketExists) {
		throw new Error(`No bucket with the name ${bucketName} exists`);
	}

	const subFolder = getSitesKey(siteName);

	const filesPromise = LambdaClientInternals.lambdaLsImplementation({
		bucketName,
		expectedBucketOwner: accountId,
		region,
		// The `/` is important to not accidentally delete sites with the same name but containing a suffix.
		prefix: `${subFolder}/`,
		forcePathStyle,
		requestHandler,
	});
	const bundlePromise = getBundle();
	const [files, bundleDir] = await waitForPromisesToFinish([
		filesPromise,
		bundlePromise,
	] as const);

	if (throwIfSiteExists && files.length > 0) {
		throw new Error(
			'`throwIfSiteExists` was passed as true, but there are already files in this folder: ' +
				files
					.slice(0, 5)
					.map((f) => f.Key)
					.join(', '),
		);
	}

	options.onDiffingProgress?.(0, false);

	let totalBytes = 0;

	const {toDelete, toUpload, existingCount} = await getS3DiffOperations({
		objects: files,
		bundle: bundleDir,
		prefix: subFolder,
		onProgress: (bytes) => {
			totalBytes = bytes;
			options.onDiffingProgress?.(bytes, false);
		},
	});

	options.onDiffingProgress?.(totalBytes, true);

	const indexHtml = 'index.html';
	const assetsToUpload = toUpload.filter((file) => file !== indexHtml);
	const indexHtmlToUpload = toUpload.filter((file) => file === indexHtml);
	const upload = (filesToUpload: string[]) => {
		if (filesToUpload.length === 0) {
			return Promise.resolve();
		}

		return uploadDir({
			bucket: bucketName,
			region,
			localDir: bundleDir,
			onProgress: options.onUploadProgress ?? (() => undefined),
			keyPrefix: subFolder,
			privacy,
			toUpload: filesToUpload,
			forcePathStyle,
			requestHandler,
		});
	};

	await upload(assetsToUpload);
	await upload(indexHtmlToUpload);

	const limit = LambdaClientInternals.pLimit(deleteConcurrency);
	const deletePromises = toDelete.map((d) => {
		return limit(() => {
			return LambdaClientInternals.lambdaDeleteFileImplementation({
				bucketName,
				customCredentials: null,
				key: d.Key as string,
				region,
				forcePathStyle,
				requestHandler,
			});
		});
	});

	await waitForPromisesToFinish(deletePromises);

	return {
		serveUrl: LambdaClientInternals.makeS3ServeUrl({
			bucketName,
			subFolder,
			region,
		}),
		siteName,
		stats: {
			uploadedFiles: toUpload.length,
			deletedFiles: toDelete.length,
			untouchedFiles: existingCount,
		},
	};
};
