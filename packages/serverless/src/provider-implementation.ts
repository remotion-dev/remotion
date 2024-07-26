export type ProviderSpecifics<Region extends string> = {
	getChromiumPath: () => string;
	getCurrentRegionInFunction: () => Region;
	regionType: Region;
};
