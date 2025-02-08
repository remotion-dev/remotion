import {REMOTION_BUCKET_PREFIX} from './constants';
import type {AwsRegion} from './regions';
import {AWS_REGIONS} from './regions';

export const parseBucketName = (
	name: string,
): {
	region: AwsRegion | null;
} => {
	const parsed = name.match(
		new RegExp(`^${REMOTION_BUCKET_PREFIX}(.*)-([a-z0-9A-Z]+)$`),
	);
	const region = parsed?.[1] as AwsRegion;

	if (!region) {
		return {region: null};
	}

	const realRegionFound = AWS_REGIONS.find(
		(r) => r.replace(/-/g, '') === region,
	);

	return {region: realRegionFound ?? null};
};
