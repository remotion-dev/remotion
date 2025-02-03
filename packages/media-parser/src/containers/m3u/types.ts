export type M3uHeader = {
	type: 'm3u-header';
};

export type M3uVersion = {
	type: 'm3u-version';
	version: string;
};

export type M3uIndependentSegments = {
	type: 'm3u-independent-segments';
};

export type M3uStreamInfo = {
	type: 'm3u-stream-info';
	bandwidth: number | null;
	averageBandwidth: number | null;
	codecs: string[] | null;
	resolution: {
		width: number;
		height: number;
	} | null;
};

export type M3uTextValue = {
	type: 'm3u-text-value';
	value: string;
};

export type M3uBox =
	| M3uHeader
	| M3uVersion
	| M3uIndependentSegments
	| M3uStreamInfo
	| M3uTextValue;

export type M3uStructure = {
	type: 'm3u';
	boxes: M3uBox[];
};
