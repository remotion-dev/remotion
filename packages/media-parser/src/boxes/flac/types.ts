import type {MetadataEntry} from '../../metadata/get-metadata';

export type FlacHeader = {
	type: 'flac-header';
};

export type FlacStreamInfo = {
	type: 'flac-streaminfo';
	minimumBlockSize: number;
	maximumBlockSize: number;
	minimumFrameSize: number;
	maximumFrameSize: number;
	sampleRate: number;
	channels: number;
	bitsPerSample: number;
	totalSamples: number;
};

export type FlacVorbisComment = {
	type: 'flac-vorbis-comment';
	fields: MetadataEntry[];
};

export type FlacUnknownBlock = {
	type: 'flac-unknown-block';
};

export type FlacStructure = {
	type: 'flac';
	boxes: (FlacHeader | FlacStreamInfo | FlacUnknownBlock | FlacVorbisComment)[];
};
