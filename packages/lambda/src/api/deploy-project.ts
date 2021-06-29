import {PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import {bundle} from '@remotion/bundler';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {getSitesKey, REMOTION_BUCKET_PREFIX} from '../shared/constants';
import {makeS3Url} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {uploadDir, UploadDirProgress} from './upload-dir';

export const deployProject = async ({
	bucketName,
	entryPoint,
	options,
	region,
}: {
	entryPoint: string;
	bucketName: string;
	region: AwsRegion;
	options?: {
		onBundleProgress?: (progress: number) => void;
		onWebsiteActivated?: () => void;
		onUploadProgress?: (upload: UploadDirProgress) => void;
	};
}) => {
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
