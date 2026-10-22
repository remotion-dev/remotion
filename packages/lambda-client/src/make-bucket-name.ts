import {REMOTION_BUCKET_PREFIX} from './constants';
import {randomHashImplementation} from './random-hash';
import type {AwsRegion} from './regions';

export const makeBucketName = (region: AwsRegion) => {
	return `${REMOTION_BUCKET_PREFIX}${region.replace(/-/g, '')}-${randomHashImplementation()}`;
};
