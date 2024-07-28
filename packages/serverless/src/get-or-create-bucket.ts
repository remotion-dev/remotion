import type {CustomCredentials} from './constants';
import {REMOTION_BUCKET_PREFIX} from './constants';
import {makeBucketName} from './make-bucket-name';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './still';

type GetOrCreateBucketInputInner<Provider extends CloudProvider> = {
	region: Provider['region'];
	enableFolderExpiry: boolean | null;
	customCredentials: CustomCredentials<Provider> | null;
	providerSpecifics: ProviderSpecifics<Provider>;
};

export type GetOrCreateBucketInput<Provider extends CloudProvider> = {
	region: Provider['region'];
	enableFolderExpiry?: boolean;
	customCredentials?: CustomCredentials<Provider>;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
	alreadyExisted: boolean;
};

export const internalGetOrCreateBucket = async <Provider extends CloudProvider>(
	params: GetOrCreateBucketInputInner<Provider>,
): Promise<GetOrCreateBucketOutput> => {
	const remotionBuckets = await params.providerSpecifics.getBuckets(
		params.region,
	);
	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets.map(
				(b) => b.name,
			)}) in your S3 region (${
				params.region
			}) starting with "${REMOTION_BUCKET_PREFIX}". Please see https://remotion.dev/docs/lambda/multiple-buckets.`,
		);
	}

	const {enableFolderExpiry, region} = params;
	if (remotionBuckets.length === 1) {
		const existingBucketName = remotionBuckets[0].name;
		// apply to existing bucket
		await params.providerSpecifics.applyLifeCycle({
			enableFolderExpiry: enableFolderExpiry ?? null,
			bucketName: existingBucketName,
			region,
			customCredentials: params.customCredentials,
		});

		return {bucketName: remotionBuckets[0].name, alreadyExisted: true};
	}

	const bucketName = makeBucketName(params.region, params.providerSpecifics);

	await params.providerSpecifics.createBucket({
		bucketName,
		region: params.region,
	});

	// apply to newly created bucket
	await params.providerSpecifics.applyLifeCycle({
		enableFolderExpiry: enableFolderExpiry ?? null,
		bucketName,
		region,
		customCredentials: params.customCredentials,
	});

	return {bucketName, alreadyExisted: false};
};
