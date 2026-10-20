import type {ProviderSpecifics} from './provider-implementation';
import type {AwsRegion} from './regions';

export const makeBucketName = (
	region: AwsRegion,
	providerSpecifics: ProviderSpecifics,
) => {
	return `${providerSpecifics.getBucketPrefix()}${region.replace(/-/g, '')}-${providerSpecifics.randomHash()}`;
};
