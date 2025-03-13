export type Mp3Info = {
	sampleRate: number;
	mpegVersion: 1 | 2;
	layer: number;
	startOfMpegStream: number;
};

export type Mp3CbrInfo = {
	bitrateKbit: number;
};

export const makeMp3State = () => {
	let mp3Info: Mp3Info | null = null;
	// cbr  = constant bit rate
	let cbrMp3Info: Mp3CbrInfo | null = null;

	return {
		getMp3Info: () => mp3Info,
		setMp3Info: (info: Mp3Info) => {
			mp3Info = info;
		},
		getCbrMp3Info: () => cbrMp3Info,
		setCbrMp3Info: (info: Mp3CbrInfo) => {
			cbrMp3Info = info;
		},
	};
};
