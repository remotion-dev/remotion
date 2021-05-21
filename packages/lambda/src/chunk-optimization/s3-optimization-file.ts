import {s3Client} from '../aws-clients';
import {getRemotionS3Buckets} from '../cleanup/s3-buckets';
import {OPTIMIZATION_PROFILE, RENDERS_BUCKET_PREFIX} from '../constants';
import {lambdaLs, lambdaReadFile, lambdaWriteFile} from '../io';
import {streamToString} from '../stream-to-string';
import {OptimizationProfile} from './types';

// TODO: Optimization per composition
export const writeOptimization = async (
	bucketName: string,
	optimization: OptimizationProfile
) => {
	await lambdaWriteFile({
		bucketName,
		body: JSON.stringify(optimization),
		forceS3: false,
		key: OPTIMIZATION_PROFILE + '.json',
	});
};

export const getOptimization =
	async (): Promise<OptimizationProfile | null> => {
		// TODO: Just use 1 bucket
		const buckets = await getRemotionS3Buckets(s3Client);
		const renderBuckets = buckets.remotionBuckets
			.filter((f) => f.Name?.startsWith(RENDERS_BUCKET_PREFIX))
			.sort(
				(a, b) =>
					(a.CreationDate?.getTime() as number) -
					(b.CreationDate?.getTime() as number)
			)
			.reverse();
		if (renderBuckets.length === 0) {
			return null;
		}

		const bucketName = renderBuckets[0].Name as string;

		const dir = await lambdaLs({
			bucketName,
			forceS3: false,
		});
		const files = dir
			.filter((d) => d.Key?.startsWith(OPTIMIZATION_PROFILE))
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
