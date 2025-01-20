import type {MetadataEntry} from '../../metadata/get-metadata';

export type WavHeader = {
	type: 'wav-header';
	fileSize: number;
};

export type WavFmt = {
	type: 'wav-fmt';
	numberOfChannels: number;
	sampleRate: number;
	byteRate: number;
	blockAlign: number;
	bitsPerSample: number;
};

export type WavList = {
	type: 'wav-list';
	metadata: MetadataEntry[];
};

export type WavId3 = {
	type: 'wav-id3';
};

export type WavData = {
	type: 'wav-data';
	dataSize: number;
};

type WavBox = WavHeader | WavFmt | WavList | WavId3 | WavData;

export type WavStructure = {
	type: 'wav';
	boxes: WavBox[];
};
