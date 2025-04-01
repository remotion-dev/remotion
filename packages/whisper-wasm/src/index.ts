import type {deleteModel as originalDeleteModel} from './delete-model';
import type {
	DownloadWhisperModelParams,
	DownloadWhisperModelResult,
	downloadWhisperModel as originalDownloadWhisperModel,
} from './download-whisper-model';
import type {getLoadedModels as originalGetLoadedModels} from './get-loaded-models';
import type {
	transcribe as originalTranscribe,
	TranscribeParams,
} from './transcribe';

export const transcribe: typeof originalTranscribe = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-wasm.',
	);
};

export const downloadWhisperModel: typeof originalDownloadWhisperModel = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-wasm.',
	);
};

export const getLoadedModels: typeof originalGetLoadedModels = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-wasm.',
	);
};

export const deleteModel: typeof originalDeleteModel = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-wasm.',
	);
};

export type {
	DownloadWhisperModelParams,
	DownloadWhisperModelResult,
	TranscribeParams,
};
