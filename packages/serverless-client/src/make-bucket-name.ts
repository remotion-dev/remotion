import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './types';

export const makeBucketName = <Provider extends CloudProvider>(
	region: Provider['region'],
	providerSpecifics: ProviderSpecifics<Provider>,
) => {
	return `${providerSpecifics.getBucketPrefix()}${region.replace(/-/g, '')}-${providerSpecifics.randomHash()}`;
};
