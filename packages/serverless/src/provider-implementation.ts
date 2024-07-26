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

type BucketObject = {
	Key: string;
	LastModified: Date;
	ETag: string;
	Size: number;
};

type ListObjects<Region extends string> = (params: {
	bucketName: string;
	prefix: string;
	region: Region;
	expectedBucketOwner: string | null;
	continuationToken?: string;
}) => Promise<BucketObject[]>;

type DeleteFile<Region extends string> = (params: {
	bucketName: string;
	key: string;
	region: Region;
	customCredentials: CustomCredentials<Region> | null;
}) => Promise<void>;

type BucketExists<Region extends string> = (params: {
	bucketName: string;
	region: Region;
	expectedBucketOwner: string | null;
}) => Promise<boolean>;

type RandomHash = () => string;

export type ProviderSpecifics<Region extends string> = {
	getChromiumPath: () => string | null;
	getCurrentRegionInFunction: () => Region;
	regionType: Region;
	getBuckets: GetBuckets<Region>;
	createBucket: CreateBucket<Region>;
	applyLifeCycle: ApplyLifeCycle<Region>;
	listObjects: ListObjects<Region>;
	deleteFile: DeleteFile<Region>;
	bucketExists: BucketExists<Region>;
	randomHash: RandomHash;
};
