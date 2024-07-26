import type {CustomCredentials} from './constants';

export type BucketWithLocation<Region extends string> = {
	name: string;
	creationDate: number;
	region: Region;
};

type GetBuckets<Region extends string> = (
	region: Region,
	forceBucketName?: string,
) => Promise<BucketWithLocation<Region>[]>;

type CreateBucket<Region extends string> = (params: {
	region: Region;
	bucketName: string;
}) => Promise<void>;

type ApplyLifeCycle<Region extends string> = (params: {
	enableFolderExpiry: boolean | null;
	bucketName: string;
	region: Region;
	customCredentials: CustomCredentials<Region> | null;
}) => Promise<void>;

export type ProviderSpecifics<Region extends string> = {
	getChromiumPath: () => string;
	getCurrentRegionInFunction: () => Region;
	regionType: Region;
	getBuckets: GetBuckets<Region>;
	createBucket: CreateBucket<Region>;
	applyLifeCycle: ApplyLifeCycle<Region>;
};
