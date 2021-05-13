import {CreateBucketCommand, PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import {s3Client} from './aws-clients';
import {bundleRemotion} from './bundle-remotion';
import {LAMBDA_BUCKET_PREFIX, REGION} from './constants';
import {uploadDir, UploadDirProgress} from './upload-dir';

export const deploySite = async (
	absoluteFile: string,
	options?: {
		onBundleProgress?: (progress: number) => void;
		onWebsiteActivated?: () => void;
		onBucketCreated?: (bucketName: string) => void;
		onUploadProgress?: (upload: UploadDirProgress) => void;
	}
) => {
	const bucketName = LAMBDA_BUCKET_PREFIX + Math.random();

	const [bundle] = await Promise.all([
		bundleRemotion(
			absoluteFile,
			options?.onBundleProgress ?? (() => undefined)
		),
		s3Client
			.send(
				new CreateBucketCommand({
					Bucket: bucketName,
					ACL: 'public-read',
				})
			)
			.then(() => {
				options?.onBucketCreated?.(bucketName);
			}),
	]);

	await Promise.all([
		uploadDir({
			bucket: bucketName,
			client: s3Client,
			dir: bundle,
			onProgress: options?.onUploadProgress ?? (() => undefined),
		}),
		s3Client
			.send(
				new PutBucketWebsiteCommand({
					Bucket: bucketName,
					WebsiteConfiguration: {
						IndexDocument: {
							Suffix: 'index.html',
						},
					},
				})
			)
			.then(() => options?.onWebsiteActivated?.()),
	]);
	// TODO: Do it with HTTPS, but wait for certificate

	const url = `http://${bucketName}.s3.${REGION}.amazonaws.com`;

	return {
		url,
		bucketName,
	};
};
