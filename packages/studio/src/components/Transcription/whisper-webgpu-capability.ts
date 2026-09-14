import {isOptionalPackageInstalled} from '../OptionalPackageModal';

export const WHISPER_WEBGPU_PACKAGE = '@remotion/whisper-webgpu';

export const isWhisperWebGpuInstalled = () =>
	isOptionalPackageInstalled(WHISPER_WEBGPU_PACKAGE);
