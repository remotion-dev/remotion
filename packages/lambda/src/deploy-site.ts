import {PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import {s3Client} from './aws-clients';
import {bundleRemotion} from './bundle-remotion';
import {getSitesKey} from './constants';
import {randomHash} from './helpers/random-hash';
import {makeS3Url} from './make-s3-url';
import {uploadDir, UploadDirProgress} from './upload-dir';

export const deploySite = async ({
	absoluteFile,
	options,
	bucketName,
}: {
	absoluteFile: string;
	bucketName: string;
	options?: {
		onBundleProgress?: (progress: number) => void;
		onWebsiteActivated?: () => void;
		onBucketCreated?: (bucketName: string) => void;
		onUploadProgress?: (upload: UploadDirProgress) => void;
	};
}) => {
	const subFolder = getSitesKey(randomHash());
	// TODO: Not necessary anmore
	options?.onBucketCreated?.(bucketName);
	const bundle = await bundleRemotion({
		entryFile: absoluteFile,
		onProgress: options?.onBundleProgress ?? (() => undefined),
		publicPath: `/${subFolder}/`,
	});

	await Promise.all([
		uploadDir({
			bucket: bucketName,
			client: s3Client,
			dir: bundle,
			onProgress: options?.onUploadProgress ?? (() => undefined),
			folder: subFolder,
		}),
		s3Client
			.send(
				new PutBucketWebsiteCommand({
					Bucket: bucketName,

					WebsiteConfiguration: {
						IndexDocument: {
							Suffix: `index.html`,
						},
					},
				})
			)
			.then(() => options?.onWebsiteActivated?.()),
	]);

	return {
		url: makeS3Url(bucketName, subFolder),
	};
};
