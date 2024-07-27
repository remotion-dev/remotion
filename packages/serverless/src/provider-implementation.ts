import type {Readable} from 'stream';
import type {CustomCredentials, DownloadBehavior, Privacy} from './constants';
import type {GetFolderFiles} from './get-files-in-folder';

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

type ReadFile<Region extends string> = (params: {
	bucketName: string;
	key: string;
	region: Region;
	expectedBucketOwner: string;
}) => Promise<Readable>;

export type WriteFileInput<Region extends string> = {
	bucketName: string;
	key: string;
	body: Readable | string | Uint8Array;
	region: Region;
	privacy: Privacy;
	expectedBucketOwner: string | null;
	downloadBehavior: DownloadBehavior | null;
	customCredentials: CustomCredentials<Region> | null;
};

type WriteFile<Region extends string> = (
	params: WriteFileInput<Region>,
) => Promise<void>;

type HeadFileInput<Region extends string> = {
	bucketName: string;
	key: string;
	region: Region;
	customCredentials: CustomCredentials<Region> | null;
};

type HeadFileOutput = {
	LastModified?: Date | undefined;
	ContentLength?: number | undefined;
};

type HeadFile<Region extends string> = (
	params: HeadFileInput<Region>,
) => Promise<HeadFileOutput>;

type RandomHash = () => string;

type ConvertToServeUrl<Region extends string> = (params: {
	urlOrId: string;
	region: Region;
	bucketName: string;
}) => string;

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
	readFile: ReadFile<Region>;
	writeFile: WriteFile<Region>;
	headFile: HeadFile<Region>;
	convertToServeUrl: ConvertToServeUrl<Region>;
	printLoggingHelper: boolean;
	getFolderFiles: GetFolderFiles;
};
