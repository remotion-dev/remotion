import type {GitSource, WebpackOverrideFn} from '@remotion/bundler';
import type {ToOptions} from '@remotion/renderer';
import type {BrowserSafeApis} from '@remotion/renderer/client';
import {NoReactAPIs} from '@remotion/renderer/pure';
import fs from 'node:fs';
import {lambdaDeleteFile, lambdaLs} from '../functions/helpers/io';
import type {AwsRegion} from '../pricing/aws-regions';
import {bundleSite} from '../shared/bundle-site';
import {getSitesKey} from '../shared/constants';
import {getAccountId} from '../shared/get-account-id';
import {getS3DiffOperations} from '../shared/get-s3-operations';
import {makeS3ServeUrl} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {validateAwsRegion} from '../shared/validate-aws-region';
import {validateBucketName} from '../shared/validate-bucketname';
import {validatePrivacy} from '../shared/validate-privacy';
import {validateSiteName} from '../shared/validate-site-name';
import {bucketExistsInRegion} from './bucket-exists';
import type {UploadDirProgress} from './upload-dir';
import {uploadDir} from './upload-dir';

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
}: MandatoryParameters & OptionalParameters): DeploySiteOutput => {
	validateAwsRegion(region);
	validateBucketName(bucketName, {
		mustStartWithRemotion: !options?.bypassBucketNameValidation,
	});

	validateSiteName(siteName);
	validatePrivacy(privacy, false);

	const accountId = await getAccountId({region});

	const bucketExists = await bucketExistsInRegion({
		bucketName,
		region,
		expectedBucketOwner: accountId,
	});
	if (!bucketExists) {
		throw new Error(`No bucket with the name ${bucketName} exists`);
	}

	const subFolder = getSitesKey(siteName);

	const [files, bundled] = await Promise.all([
		lambdaLs({
			bucketName,
			expectedBucketOwner: accountId,
			region,
			// The `/` is important to not accidentially delete sites with the same name but containing a suffix.
			prefix: `${subFolder}/`,
		}),
		bundleSite({
			publicPath: `/${subFolder}/`,
			webpackOverride: options?.webpackOverride ?? ((f) => f),
			enableCaching: options?.enableCaching ?? true,
			publicDir: options?.publicDir,
			rootDir: options?.rootDir,
			ignoreRegisterRootWarning: options?.ignoreRegisterRootWarning,
			onProgress: options?.onBundleProgress ?? (() => undefined),
			entryPoint,
			gitSource,
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

	const {toDelete, toUpload, existingCount} = await getS3DiffOperations({
		objects: files,
		bundle: bundled,
		prefix: subFolder,
	});

	await Promise.all([
		uploadDir({
			bucket: bucketName,
			region,
			localDir: bundled,
			onProgress: options?.onUploadProgress ?? (() => undefined),
			keyPrefix: subFolder,
			privacy: privacy ?? 'public',
			toUpload,
		}),
		Promise.all(
			toDelete.map((d) => {
				return lambdaDeleteFile({
					bucketName,
					customCredentials: null,
					key: d.Key as string,
					region,
				});
			}),
		),
	]);

	if (!process.env.VITEST) {
		fs.rmSync(bundled, {
			recursive: true,
		});
	}

	return {
		serveUrl: makeS3ServeUrl({bucketName, subFolder, region}),
		siteName,
		stats: {
			uploadedFiles: toUpload.length,
			deletedFiles: toDelete.length,
			untouchedFiles: existingCount,
		},
	};
};

export const internalDeploySite =
	NoReactAPIs.wrapWithErrorHandling(mandatoryDeploySite);

/**
 * @description Deploys a Remotion project to an S3 bucket to prepare it for rendering on AWS Lambda.
 * @see [Documentation](https://remotion.dev/docs/lambda/deploysite)
 * @param {AwsRegion} params.region The region in which the S3 bucket resides in.
 * @param {string} params.entryPoint An absolute path to the entry file of your Remotion project.
 * @param {string} params.bucketName The name of the bucket to deploy your project into.
 * @param {string} params.siteName The name of the folder in which the project gets deployed to.
 * @param {object} params.options Further options, see documentation page for this function.
 */
export const deploySite = (args: DeploySiteInput) => {
	return internalDeploySite({
		bucketName: args.bucketName,
		entryPoint: args.entryPoint,
		region: args.region,
		gitSource: args.gitSource ?? null,
		options: args.options ?? {},
		privacy: args.privacy ?? 'public',
		siteName: args.siteName ?? randomHash(),
		indent: false,
		logLevel: 'info',
		throwIfSiteExists: args.throwIfSiteExists ?? false,
	});
};
