import type {XingData} from '../containers/mp3/parse-xing';
import {audioSampleMapState} from './audio-sample-map';

export type Mp3Info = {
	sampleRate: number;
	mpegVersion: 1 | 2;
	layer: number;
};

export type VariableMp3BitrateInfo = {
	type: 'variable';
	xingData: XingData;
};

export type Mp3BitrateInfo =
	| {
			type: 'constant';
			bitrateInKbit: number;
	  }
	| VariableMp3BitrateInfo;

export const makeMp3State = () => {
	let mp3Info: Mp3Info | null = null;
	let bitrateInfo: Mp3BitrateInfo | null = null;

	const audioSamples = audioSampleMapState();

	return {
		getMp3Info: () => mp3Info,
		setMp3Info: (info: Mp3Info) => {
			mp3Info = info;
		},
		getMp3BitrateInfo: () => bitrateInfo,
		setMp3BitrateInfo: (info: Mp3BitrateInfo) => {
			bitrateInfo = info;
		},
		audioSamples,
	};
};

export type Mp3State = ReturnType<typeof makeMp3State>;
