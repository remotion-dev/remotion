import type {CustomCredentials} from './constants';
import {makeBucketName} from './make-bucket-name';
import type {ProviderSpecifics} from './provider-implementation';
import type {CloudProvider} from './types';

type GetOrCreateBucketInputInner<Provider extends CloudProvider> = {
	region: Provider['region'];
	enableFolderExpiry: boolean | null;
	customCredentials: CustomCredentials<Provider> | null;
	providerSpecifics: ProviderSpecifics<Provider>;
	forcePathStyle: boolean;
	skipPutAcl: boolean;
};

export type GetOrCreateBucketInput<Provider extends CloudProvider> = {
	region: Provider['region'];
	enableFolderExpiry?: boolean;
	customCredentials?: CustomCredentials<Provider>;
	forcePathStyle?: boolean;
};

export type GetOrCreateBucketOutput = {
	bucketName: string;
	alreadyExisted: boolean;
};

export const internalGetOrCreateBucket = async <Provider extends CloudProvider>(
	params: GetOrCreateBucketInputInner<Provider>,
): Promise<GetOrCreateBucketOutput> => {
	const remotionBuckets = await params.providerSpecifics.getBuckets({
		region: params.region,
		forceBucketName: null,
		forcePathStyle: params.forcePathStyle,
	});
	if (remotionBuckets.length > 1) {
		throw new Error(
			`You have multiple buckets (${remotionBuckets.map(
				(b) => b.name,
			)}) in your S3 region (${
				params.region
			}) starting with "${params.providerSpecifics.getBucketPrefix()}". Please see https://remotion.dev/docs/lambda/multiple-buckets.`,
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
			forcePathStyle: params.forcePathStyle,
		});

		return {bucketName: remotionBuckets[0].name, alreadyExisted: true};
	}

	const bucketName = makeBucketName(params.region, params.providerSpecifics);

	await params.providerSpecifics.createBucket({
		bucketName,
		region: params.region,
		forcePathStyle: params.forcePathStyle,
		skipPutAcl: params.skipPutAcl,
	});

	// apply to newly created bucket
	await params.providerSpecifics.applyLifeCycle({
		enableFolderExpiry: enableFolderExpiry ?? null,
		bucketName,
		region,
		customCredentials: params.customCredentials,
		forcePathStyle: params.forcePathStyle,
	});

	return {bucketName, alreadyExisted: false};
};
