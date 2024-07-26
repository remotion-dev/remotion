export type BucketWithLocation<Region extends string> = {
	name: string;
	creationDate: number;
	region: Region;
};

type GetBuckets<Region extends string> = (
	region: Region,
	forceBucketName?: string,
) => Promise<BucketWithLocation<Region>[]>;

export type ProviderSpecifics<Region extends string> = {
	getChromiumPath: () => string;
	getCurrentRegionInFunction: () => Region;
	regionType: Region;
	getBuckets: GetBuckets<Region>;
};
