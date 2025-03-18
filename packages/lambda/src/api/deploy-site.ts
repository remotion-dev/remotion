import {type GitSource, type WebpackOverrideFn} from '@remotion/bundler';
import type {AwsRegion} from '@remotion/lambda-client';
import {LambdaClientInternals, type AwsProvider} from '@remotion/lambda-client';
import {
	getSitesKey,
	REMOTION_BUCKET_PREFIX,
} from '@remotion/lambda-client/constants';
import type {ToOptions} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {wrapWithErrorHandling} from '@remotion/renderer/error-handling';
import type {
	FullClientSpecifics,
	ProviderSpecifics,
	UploadDirProgress,
} from '@remotion/serverless';
import {validateBucketName, validatePrivacy} from '@remotion/serverless';
import fs from 'node:fs';
import {awsFullClientSpecifics} from '../functions/full-client-implementation';
import {getS3DiffOperations} from '../shared/get-s3-operations';
import {validateSiteName} from '../shared/validate-site-name';

type MandatoryParameters = {
	entryPoint: string;
	bucketName: string;
	region: AwsRegion;
};

type OptionalParameters = {
	siteName: string;
	options: {
		onBundleProgress?: (progress: number) => void;
		onUploadProgress?: (upload: UploadDirProgress) => void;
		onDiffingProgress?: (bytes: number, done: boolean) => void;
		webpackOverride?: WebpackOverrideFn;
		ignoreRegisterRootWarning?: boolean;
		enableCaching?: boolean;
		publicDir?: string | null;
		rootDir?: string;
		bypassBucketNameValidation?: boolean;
	};
	privacy: 'public' | 'no-acl';
	gitSource: GitSource | null;
	indent: boolean;
	forcePathStyle: boolean;
} & ToOptions<typeof BrowserSafeApis.optionsMap.deploySiteLambda>;

export type DeploySiteInput = MandatoryParameters & Partial<OptionalParameters>;

export type DeploySiteOutput = Promise<{
	serveUrl: string;
	siteName: string;
	stats: {
		uploadedFiles: number;
		deletedFiles: number;
		untouchedFiles: number;
	};
}>;

const mandatoryDeploySite = async ({
	bucketName,
	entryPoint,
	siteName,
	options,
	region,
	privacy,
	gitSource,
	throwIfSiteExists,
	providerSpecifics,
	forcePathStyle,
	fullClientSpecifics,
}: MandatoryParameters &
	OptionalParameters & {
		providerSpecifics: ProviderSpecifics<AwsProvider>;
		fullClientSpecifics: FullClientSpecifics<AwsProvider>;
	}): DeploySiteOutput => {
	LambdaClientInternals.validateAwsRegion(region);
	validateBucketName({
		bucketName,
		bucketNamePrefix: REMOTION_BUCKET_PREFIX,
		options: {
			mustStartWithRemotion: !options?.bypassBucketNameValidation,
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
	});
	if (!bucketExists) {
		throw new Error(`No bucket with the name ${bucketName} exists`);
	}

	const subFolder = getSitesKey(siteName);

	const [files, bundled] = await Promise.all([
		providerSpecifics.listObjects({
			bucketName,
			expectedBucketOwner: accountId,
			region,
			// The `/` is important to not accidentially delete sites with the same name but containing a suffix.
			prefix: `${subFolder}/`,
			forcePathStyle,
		}),
		fullClientSpecifics.bundleSite({
			publicPath: `/${subFolder}/`,
			webpackOverride: options?.webpackOverride ?? ((f) => f),
			enableCaching: options?.enableCaching ?? true,
			publicDir: options?.publicDir ?? null,
			rootDir: options?.rootDir ?? null,
			ignoreRegisterRootWarning: options?.ignoreRegisterRootWarning ?? false,
			onProgress: options?.onBundleProgress ?? (() => undefined),
			entryPoint,
			gitSource,
			bufferStateDelayInMilliseconds: null,
			maxTimelineTracks: null,
			onDirectoryCreated: () => undefined,
			onPublicDirCopyProgress: () => undefined,
			onSymlinkDetected: () => undefined,
			outDir: null,
		}),
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
		bundle: bundled,
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
			localDir: bundled,
			onProgress: options?.onUploadProgress ?? (() => undefined),
			keyPrefix: subFolder,
			privacy: privacy ?? 'public',
			toUpload,
			forcePathStyle,
		}),
		Promise.all(
			toDelete.map((d) => {
				return providerSpecifics.deleteFile({
					bucketName,
					customCredentials: null,
					key: d.Key as string,
					region,
					forcePathStyle,
				});
			}),
		),
	]);

	if (fs.existsSync(bundled)) {
		fs.rmSync(bundled, {
			recursive: true,
		});
	}

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

export const internalDeploySite = wrapWithErrorHandling(mandatoryDeploySite);

/*
 * @description Deploys a Remotion project to a GCP storage bucket to prepare it for rendering on Cloud Run.
 * @see [Documentation](https://remotion.dev/docs/cloudrun/deploysite)
 */
export const deploySite = (args: DeploySiteInput) => {
	return internalDeploySite({
		bucketName: args.bucketName,
		entryPoint: args.entryPoint,
		region: args.region,
		gitSource: args.gitSource ?? null,
		options: args.options ?? {},
		privacy: args.privacy ?? 'public',
		siteName:
			args.siteName ?? LambdaClientInternals.awsImplementation.randomHash(),
		indent: false,
		logLevel: 'info',
		throwIfSiteExists: args.throwIfSiteExists ?? false,
		providerSpecifics: LambdaClientInternals.awsImplementation,
		forcePathStyle: args.forcePathStyle ?? false,
		fullClientSpecifics: awsFullClientSpecifics,
	});
};
