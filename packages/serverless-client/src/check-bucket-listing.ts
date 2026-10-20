import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './types';

export const checkBucketListing = async <Provider extends CloudProvider>({
	bucketName,
	region,
	providerSpecifics,
}: {
	bucketName: string;
	region: Provider['region'];
	providerSpecifics: ProviderSpecifics<Provider>;
}) => {
	const url = providerSpecifics.getBucketListingUrl({bucketName, region});
	if (url === null) {
		return;
	}

	try {
		const res = await fetch(url);
		if (res.status === 200) {
			// eslint-disable-next-line no-console
			console.warn(
				`Warning: Your bucket ${bucketName} allows public listing of its contents. See ${providerSpecifics.getDocsUrl('bucket-security')} for how to fix this.`,
			);
		}
	} catch {
		// Ignore - best effort check
	}
};
