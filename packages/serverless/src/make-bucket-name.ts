import {REMOTION_BUCKET_PREFIX} from './constants';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './still';

export const makeBucketName = <Provider extends CloudProvider>(
	region: Provider['region'],
	providerSpecifics: ProviderSpecifics<Provider>,
) => {
	return `${REMOTION_BUCKET_PREFIX}${region.replace(/-/g, '')}-${providerSpecifics.randomHash()}`;
};
