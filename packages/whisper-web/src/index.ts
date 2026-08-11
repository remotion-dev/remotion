import type {
	CanUseWhisperWebResult,
	canUseWhisperWeb as originalCanUseWhisperWeb,
	WhisperWebUnsupportedReason,
} from './can-use-whisper-web';
import type {WhisperWebLanguage, WhisperWebModel} from './constants';
import type {deleteModel as originalDeleteModel} from './delete-model';
import type {
	DownloadWhisperModelOnProgress,
	DownloadWhisperModelParams,
	DownloadWhisperModelProgress,
	DownloadWhisperModelResult,
	downloadWhisperModel as originalDownloadWhisperModel,
} from './download-whisper-model';
import type {
	AvailableModel,
	getAvailableModels as originalGetAvailableModels,
} from './get-available-models';
import type {getLoadedModels as originalGetLoadedModels} from './get-loaded-models';
import type {
	resampleTo16Khz as originalResampleTo16Khz,
	ResampleTo16KhzParams,
} from './resample-to-16khz';
import type {TranscriptionItemWithTimestamp, TranscriptionJson} from './result';
import type {toCaptions as originalToCaptions} from './to-captions';
import type {
	transcribe as originalTranscribe,
	TranscribeParams,
} from './transcribe';

export const transcribe: typeof originalTranscribe = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-web.',
	);
};

export const downloadWhisperModel: typeof originalDownloadWhisperModel = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-web.',
	);
};

export const getLoadedModels: typeof originalGetLoadedModels = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-web.',
	);
};

export const getAvailableModels: typeof originalGetAvailableModels = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-web.',
	);
};

export const deleteModel: typeof originalDeleteModel = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-web.',
	);
};

export const canUseWhisperWeb: typeof originalCanUseWhisperWeb = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-web.',
	);
};

export const resampleTo16Khz: typeof originalResampleTo16Khz = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-web.',
	);
};

export const toCaptions: typeof originalToCaptions = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-web.',
	);
};

export type {
	AvailableModel,
	CanUseWhisperWebResult,
	DownloadWhisperModelOnProgress,
	DownloadWhisperModelParams,
	DownloadWhisperModelProgress,
	DownloadWhisperModelResult,
	ResampleTo16KhzParams,
	TranscribeParams,
	TranscriptionItemWithTimestamp,
	TranscriptionJson,
	WhisperWebLanguage,
	WhisperWebModel,
	WhisperWebUnsupportedReason,
};
