export type Mp3Info = {
	sampleRate: number;
	mpegVersion: 1 | 2;
	layer: number;
	bitrateKbit: number;
	startOfMpegStream: number;
};

export const makeMp3State = () => {
	let mp3Info: Mp3Info | null = null;

	return {
		getMp3Info: () => mp3Info,
		setMp3Info: (info: Mp3Info) => {
			mp3Info = info;
		},
	};
};
