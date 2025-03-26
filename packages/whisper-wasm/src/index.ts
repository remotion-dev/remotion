/* eslint-disable @typescript-eslint/no-unused-vars */

import type {TranscribeParams} from './transcribe';

// Ensures transcribe() returns a Promise that resolves to a string
export const transcribe = async (_args: TranscribeParams): Promise<string> => {
	throw new Error('cjs not supported');
};

export type WhisperModel =
	| 'tiny'
	| 'tiny.en'
	| 'base'
	| 'base.en'
	| 'small'
	| 'small.en';

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
