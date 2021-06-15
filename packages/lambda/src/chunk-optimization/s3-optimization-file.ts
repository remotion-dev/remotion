import {optimizationProfile} from '../constants';
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

export const getOptimization = async ({
	siteId,
	compositionId,
	bucketName,
}: {
	bucketName: string;
	siteId: string;
	compositionId: string;
}): Promise<OptimizationProfile | null> => {
	const prefix = optimizationProfile(siteId, compositionId);
	const dir = await lambdaLs({
		bucketName,
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
