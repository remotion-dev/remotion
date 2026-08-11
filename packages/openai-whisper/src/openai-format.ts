export interface TranscriptionWord {
	end: number;
	start: number;
	word: string;
}

export interface TranscriptionSegment {
	id: number;
	avg_logprob: number;
	compression_ratio: number;
	end: number;
	no_speech_prob: number;
	seek: number;
	start: number;
	temperature: number;
	text: string;
	tokens: Array<number>;
}

export interface OpenAiVerboseTranscription {
	duration: number | string;
	task?: 'transcribe';
	language: string;
	text: string;
	segments?: Array<TranscriptionSegment>;
	words?: Array<TranscriptionWord>;
}
