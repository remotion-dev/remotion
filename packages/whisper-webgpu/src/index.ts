import type {
	CanUseWhisperWebGpuResult,
	canUseWhisperWebGpu as originalCanUseWhisperWebGpu,
	WhisperWebGpuUnsupportedReason,
} from './can-use-whisper-webgpu';
import type {WhisperWebGpuLanguage, WhisperWebGpuModel} from './constants';
import type {deleteModel as originalDeleteModel} from './delete-model';
import type {
	DownloadWhisperModelOnProgress,
	DownloadWhisperModelParams,
	DownloadWhisperModelProgress,
	DownloadWhisperModelResult,
	downloadWhisperModel as originalDownloadWhisperModel,
} from './download-whisper-model';
import type {getLoadedModels as originalGetLoadedModels} from './get-loaded-models';
import type {
	resampleTo16Khz as originalResampleTo16Khz,
	ResampleTo16KhzParams,
} from './resample-to-16khz';
import type {
	transcribe as originalTranscribe,
	TranscribeParams,
} from './transcribe';

export const transcribe: typeof originalTranscribe = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-webgpu.',
	);
};

export const downloadWhisperModel: typeof originalDownloadWhisperModel = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-webgpu.',
	);
};

export const getLoadedModels: typeof originalGetLoadedModels = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-webgpu.',
	);
};

export const deleteModel: typeof originalDeleteModel = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-webgpu.',
	);
};

export const canUseWhisperWebGpu: typeof originalCanUseWhisperWebGpu = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-webgpu.',
	);
};

export const resampleTo16Khz: typeof originalResampleTo16Khz = () => {
	throw new Error(
		'Loading this module from CommonJS is not supported. Load the ESM version of @remotion/whisper-webgpu.',
	);
};

export type {
	CanUseWhisperWebGpuResult,
	DownloadWhisperModelOnProgress,
	DownloadWhisperModelParams,
	DownloadWhisperModelProgress,
	DownloadWhisperModelResult,
	ResampleTo16KhzParams,
	TranscribeParams,
	WhisperWebGpuLanguage,
	WhisperWebGpuModel,
	WhisperWebGpuUnsupportedReason,
};
