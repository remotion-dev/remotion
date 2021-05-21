import {OPTIMIZATION_PROFILE} from '../constants';
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

export const getOptimization = async (
	bucketName: string
): Promise<OptimizationProfile | null> => {
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
