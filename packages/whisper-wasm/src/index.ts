/* eslint-disable @typescript-eslint/no-unused-vars */

export interface Transcribe {
	file: File;
	onProgress?: (p: number) => void;
	onTranscribeChunk?: (start: string, end: string, text: string) => void;
	threads?: number;
}

// Ensures transcribe() returns a Promise that resolves to a string
export const transcribe = async (_args: Transcribe): Promise<string> => {
	throw new Error('cjs not supported');
};

export type WhisperModel =
	| 'tiny'
	| 'tiny.en'
	| 'base'
	| 'base.en'
	| 'small'
	| 'small.en'
	| 'medium'
	| 'medium.en'
	| 'large-v1'
	| 'large-v2'
	| 'large-v3'
	| 'large-v3-turbo';

export interface DownloadWhisperModel {
	model: WhisperModel;
	onProgress?: (progress: number) => void;
}

// Ensures downloadWhisperModel() returns a Promise that resolves to a string
export const downloadWhisperModel = async (
	_args: DownloadWhisperModel,
): Promise<string> => {
	throw new Error('cjs not supported');
};
