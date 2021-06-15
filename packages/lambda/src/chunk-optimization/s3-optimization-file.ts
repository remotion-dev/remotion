import {s3Client} from '../aws-clients';
import {getRemotionS3Buckets} from '../cleanup/s3-buckets';
import {optimizationProfile, REMOTION_BUCKET_PREFIX} from '../constants';
import {streamToString} from '../helpers/stream-to-string';
import {lambdaLs, lambdaReadFile, lambdaWriteFile} from '../io';
import {OptimizationProfile} from './types';

export const writeOptimization = async ({
	bucketName,
	optimization,
	compositionId,
	siteId,
}: {
	bucketName: string;
	optimization: OptimizationProfile;
	compositionId: string;
	siteId: string;
}) => {
	await lambdaWriteFile({
		bucketName,
		body: JSON.stringify(optimization),
		forceS3: false,
		key: optimizationProfile(siteId, compositionId) + '.json',
	});
};

export const getNewestRenderBucket = async () => {
	// TODO: Just use 1 bucket, already have it
	const buckets = await getRemotionS3Buckets(s3Client);
	const renderBuckets = buckets.remotionBuckets
		.filter((f) => f.Name?.startsWith(REMOTION_BUCKET_PREFIX))
		.sort(
			(a, b) =>
				(new Date(a.CreationDate as Date)?.getTime() as number) -
				(new Date(b.CreationDate as Date)?.getTime() as number)
		)
		.reverse();
	return renderBuckets[0] ?? null;
};

export const getOptimization = async ({
	siteId,
	compositionId,
}: {
	siteId: string;
	compositionId: string;
}): Promise<OptimizationProfile | null> => {
	// TODO: already have render bucket id
	const bucket = await getNewestRenderBucket();
	if (bucket === null) {
		return null;
	}

	const bucketName = bucket.Name as string;

	const prefix = optimizationProfile(siteId, compositionId);
	const dir = await lambdaLs({
		bucketName,
		forceS3: false,
		prefix,
	});
	const files = dir
		.sort(
			(a, b) =>
				(a.LastModified?.getTime() as number) -
				(b.LastModified?.getTime() as number)
		)
		.reverse();
	if (files.length === 0) {
		return null;
	}

	const body = await lambdaReadFile({
		bucketName,
		key: files[0].Key as string,
	});

	const str = await streamToString(body);

	return JSON.parse(str) as OptimizationProfile;
};
