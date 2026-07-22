import type {AwsRegion, RequestHandler} from '@remotion/lambda-client';
import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import {
	getSitesKey,
	REMOTION_BUCKET_PREFIX,
} from '@remotion/lambda-client/constants';
import type {
	FullClientSpecifics,
	ProviderSpecifics,
	UploadDirProgress,
} from '@remotion/serverless';
import {validateBucketName, validatePrivacy} from '@remotion/serverless';
import {getS3DiffOperations} from './get-s3-operations';
import {validateSiteName} from './validate-site-name';

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
	providerSpecifics: ProviderSpecifics<AwsProvider>;
	forcePathStyle: boolean;
	fullClientSpecifics: FullClientSpecifics<AwsProvider>;
	requestHandler: RequestHandler | null;
	getBundle: () => Promise<string>;
};

export const deploySiteWithBundle: (
	input: DeploySiteWithBundleInput,
) => DeploySiteOutput = async ({
	bucketName,
	region,
	siteName,
	options,
	privacy,
	throwIfSiteExists,
	providerSpecifics,
	forcePathStyle,
	fullClientSpecifics,
	requestHandler,
	getBundle,
}) => {
	LambdaClientInternals.validateAwsRegion(region);
	validateBucketName({
		bucketName,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
		options: {
			mustStartWithRemotion: !options.bypassBucketNameValidation,
		},
	});

	validateSiteName(siteName);
	validatePrivacy(privacy, false);

	const accountId = await providerSpecifics.getAccountId({region});

	const bucketExists = await providerSpecifics.bucketExists({
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

	const [files, bundleDir] = await Promise.all([
		providerSpecifics.listObjects({
			bucketName,
			expectedBucketOwner: accountId,
			region,
			// The `/` is important to not accidentally delete sites with the same name but containing a suffix.
			prefix: `${subFolder}/`,
			forcePathStyle,
			requestHandler,
		}),
		getBundle(),
	]);

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
		fullClientSpecifics,
	});

	options.onDiffingProgress?.(totalBytes, true);

	await Promise.all([
		fullClientSpecifics.uploadDir({
			bucket: bucketName,
			region,
			localDir: bundleDir,
			onProgress: options.onUploadProgress ?? (() => undefined),
			keyPrefix: subFolder,
			privacy,
			toUpload,
			forcePathStyle,
			requestHandler,
		}),
		Promise.all(
			toDelete.map((d) => {
				return providerSpecifics.deleteFile({
					bucketName,
					customCredentials: null,
					key: d.Key as string,
					region,
					forcePathStyle,
					requestHandler,
				});
			}),
		),
	]);

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
