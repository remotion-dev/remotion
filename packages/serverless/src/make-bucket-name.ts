import {REMOTION_BUCKET_PREFIX} from './constants';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './still';

export const makeBucketName = <
	Provider extends CloudProvider,
	Region extends string,
>(
	region: Region,
	providerSpecifics: ProviderSpecifics<Provider, Region>,
) => {
	return `${REMOTION_BUCKET_PREFIX}${region.replace(/-/g, '')}-${providerSpecifics.randomHash()}`;
};
