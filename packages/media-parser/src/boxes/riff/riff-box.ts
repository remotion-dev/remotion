export type WaveFormatBox = {
	type: 'wave-format-box';
	formatTag: 1;
	numberOfChannels: number;
	sampleRate: number;
	blockAlign: number;
	byteRate: number;
	bitsPerSample: number;
};

export type ListBox = {
	type: 'list-box';
	listType: string;
	children: RiffBox[];
};

export type RiffRegularBox = {
	type: 'riff-box';
	size: number;
	id: string;
};

export type AvihBox = {
	type: 'avih-box';
	microSecPerFrame: number;
	maxBytesPerSecond: number;
	paddingGranularity: number;
	flags: number;
	totalFrames: number;
	initialFrames: number;
	streams: number;
	suggestedBufferSize: number;
	width: number;
	height: number;
};

export type StrhBox = {
	type: 'strh-box';
	fccType: 'vids' | 'auds';
	handler: 'H264' | number;
	flags: number;
	priority: number;
	initialFrames: number;
	scale: number;
	rate: number;
	start: number;
	length: number;
	suggestedBufferSize: number;
	quality: number;
	sampleSize: number;
	language: number;
};

export type StrfBoxVideo = {
	type: 'strf-box-video';
	biSize: number;
	width: number;
	height: number;
	planes: number;
	bitCount: number;
	compression: string;
	sizeImage: number;
	xPelsPerMeter: number;
	yPelsPerMeter: number;
	clrUsed: number;
	clrImportant: number;
};

export type StrfBoxAudio = {
	type: 'strf-box-audio';
	formatTag: number;
	numberOfChannels: number;
	sampleRate: number;
	avgBytesPerSecond: number;
	blockAlign: number;
	bitsPerSample: number;
	cbSize: number;
};

export type RiffHeader = {
	type: 'riff-header';
	fileSize: number;
	fileType: string;
};

export type MoviBox = {
	type: 'movi-box';
};

export type IsftBox = {
	type: 'isft-box';
	software: string;
};

export type RiffBox =
	| RiffRegularBox
	| WaveFormatBox
	| RiffHeader
	| ListBox
	| AvihBox
	| StrhBox
	| StrfBoxVideo
	| StrfBoxAudio
	| MoviBox
	| IsftBox;
