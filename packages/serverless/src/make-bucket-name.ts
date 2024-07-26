import {REMOTION_BUCKET_PREFIX} from './constants';
import {randomHash} from './random-hash';

export const makeBucketName = <Region extends string>(region: Region) => {
	return `${REMOTION_BUCKET_PREFIX}${region.replace(/-/g, '')}-${randomHash({
		randomInTests: false,
	})}`;
};
