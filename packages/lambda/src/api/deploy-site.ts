import {PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import {bundle} from '@remotion/bundler';
import {Internals, WebpackOverrideFn} from 'remotion';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {getSitesKey, REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {makeS3Url} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {uploadDir, UploadDirProgress} from './upload-dir';

type DeploySiteInput = {
	entryPoint: string;
	bucketName: string;
	region: AwsRegion;
	projectName?: string;
	options?: {
		onBundleProgress?: (progress: number) => void;
		onWebsiteActivated?: () => void;
		onUploadProgress?: (upload: UploadDirProgress) => void;
		webpackOverride?: WebpackOverrideFn;
		enableCaching?: boolean;
	};
};

/**
 * @description Deploys a Remotion project to an S3 bucket to prepare it for rendering on AWS Lambda.
 * @link https://remotion.dev/docs/lambda/deploysite
 * @param {AwsRegion} params.region The region in which the S3 bucket resides in.
 * @param {string} params.entryPoint An absolute path to the entry file of your Remotion project.
 * @param {string} params.bucketName The name of the bucket to deploy your project into.
 * @param {string} params.projectName The name of the folder in which the project gets deployed to.
 * @param {object} params.options Further options, see documentation page for this function.
 */
export const deploySite = async ({
	bucketName,
	entryPoint,
	options,
	region,
}: DeploySiteInput) => {
	if (!bucketName.startsWith(REMOTION_BUCKET_PREFIX)) {
		throw new Error(
			`The bucketName parameter must start with ${REMOTION_BUCKET_PREFIX}.`
		);
	}

	const subFolder = getSitesKey(randomHash());
	const bundled = await bundle(
		entryPoint,
		options?.onBundleProgress ?? (() => undefined),
		{
			publicPath: `/${subFolder}/`,
			webpackOverride:
				options?.webpackOverride ?? Internals.getWebpackOverrideFn(),
			enableCaching: options?.enableCaching ?? Internals.getWebpackCaching(),
		}
	);

	await Promise.all([
		uploadDir({
			bucket: bucketName,
			client: getS3Client(region),
			dir: bundled,
			onProgress: options?.onUploadProgress ?? (() => undefined),
			folder: subFolder,
		}),
		getS3Client(region)
			.send(
				new PutBucketWebsiteCommand({
					Bucket: bucketName,

					WebsiteConfiguration: {
						IndexDocument: {
							// TODO: but it doesn't exist
							// TODO: shouldn't we do this before
							Suffix: `index.html`,
						},
					},
				})
			)
			// TODO if we decide to keep it, add callback to docs
			.then(() => options?.onWebsiteActivated?.()),
	]);

	return {
		url: makeS3Url({bucketName, subFolder, region}),
	};
};
