export type MediaParserAvcSppData = {
	type: 'avc-sps-pps';
	data: Uint8Array;
};

export type MediaParserHvccData = {
	type: 'hvcc-data';
	data: Uint8Array;
};

export type MediaParserAv1cData = {
	type: 'av1c-data';
	data: Uint8Array;
};

export type MediaParserAacConfig = {
	type: 'aac-config';
	data: Uint8Array;
};

export type MediaParserFlacDescription = {
	type: 'flac-description';
	data: Uint8Array;
};

export type UnknownCodecData = {
	type: 'unknown-data';
	data: Uint8Array;
};

export type MediaParserOggIdentification = {
	type: 'ogg-identification';
	data: Uint8Array;
};

export type MediaParserCodecData =
	| MediaParserAvcSppData
	| MediaParserHvccData
	| MediaParserAv1cData
	| MediaParserAacConfig
	| MediaParserFlacDescription
	| MediaParserOggIdentification
	| UnknownCodecData;
