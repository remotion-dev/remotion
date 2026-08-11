export type ElevenLabsTranscriptWord = {
	text: string;
	start: number;
	end: number;
	type: 'word' | 'spacing' | 'audio_event';
	logprob: number;
};

export type ElevenLabsTranscript = {
	language_code: string;
	language_probability: number;
	text: string;
	words: ElevenLabsTranscriptWord[];
	transcription_id: string;
};
