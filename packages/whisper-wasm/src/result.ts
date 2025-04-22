type Result = {
	language: string;
};

type Model = {
	type: string;
	multilingual: boolean;
	vocab: number;
	audio: {
		ctx: number;
		state: number;
		head: number;
		layer: number;
	};
	text: {
		ctx: number;
		state: number;
		head: number;
		layer: number;
	};
	mels: number;
	ftype: number;
};

type Timestamps = {
	from: string;
	to: string;
};

type Offsets = {
	from: number;
	to: number;
};

type TranscriptionItem = {
	timestamps: Timestamps;
	offsets: Offsets;
	text: string;
};

export type WordLevelToken = {
	t_dtw: number;
	text: string;
	timestamps: Timestamps;
	offsets: Offsets;
	id: number;
	p: number;
};

export type TranscriptionItemWithTimestamp = TranscriptionItem & {
	tokens: WordLevelToken[];
};

export type TranscriptionJson = {
	systeminfo: string;
	model: Model;
	result: Result;
	transcription: TranscriptionItemWithTimestamp[];
};
