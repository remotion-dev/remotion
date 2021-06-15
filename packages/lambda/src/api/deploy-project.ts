import {PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import {s3Client} from '../shared/aws-clients';
import {getSitesKey} from '../shared/constants';
import {makeS3Url} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {bundleRemotion} from './bundle-remotion';
import {uploadDir, UploadDirProgress} from './upload-dir';

export const deployProject = async ({
	entryPoint,
	options,
	bucketName,
}: {
	entryPoint: string;
	bucketName: string;
	options?: {
		onBundleProgress?: (progress: number) => void;
		onWebsiteActivated?: () => void;
		onUploadProgress?: (upload: UploadDirProgress) => void;
	};
}) => {
	const subFolder = getSitesKey(randomHash());
	const bundle = await bundleRemotion({
		entryFile: entryPoint,
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
