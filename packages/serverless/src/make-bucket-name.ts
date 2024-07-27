import {REMOTION_BUCKET_PREFIX} from './constants';
import type {ProviderSpecifics} from './provider-implementation';

export const makeBucketName = <Region extends string>(
	region: Region,
	providerSpecifics: ProviderSpecifics<Region>,
) => {
	return `${REMOTION_BUCKET_PREFIX}${region.replace(/-/g, '')}-${providerSpecifics.randomHash()}`;
};
