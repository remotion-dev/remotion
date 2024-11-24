export type RiffRegularBox = {
	type: 'riff-box';
	size: number;
	id: string;
};

export type RiffHeader = {
	type: 'riff-header';
	fileSize: number;
	fileType: string;
};

export type RiffBox = RiffRegularBox | RiffHeader;
