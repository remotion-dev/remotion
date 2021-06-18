import {PutBucketWebsiteCommand} from '@aws-sdk/client-s3';
import {AwsRegion} from '../pricing/aws-regions';
import {getS3Client} from '../shared/aws-clients';
import {getSitesKey} from '../shared/constants';
import {makeS3Url} from '../shared/make-s3-url';
import {randomHash} from '../shared/random-hash';
import {bundleRemotion} from './bundle-remotion';
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
	const subFolder = getSitesKey(randomHash());
	const bundle = await bundleRemotion({
		entryFile: entryPoint,
		onProgress: options?.onBundleProgress ?? (() => undefined),
		publicPath: `/${subFolder}/`,
	});

	await Promise.all([
		uploadDir({
			bucket: bucketName,
			client: getS3Client(region),
			dir: bundle,
			onProgress: options?.onUploadProgress ?? (() => undefined),
			folder: subFolder,
		}),
		getS3Client(region)
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
		url: makeS3Url({bucketName, subFolder, region}),
	};
};
