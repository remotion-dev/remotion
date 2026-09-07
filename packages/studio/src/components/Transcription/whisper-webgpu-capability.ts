export const WHISPER_WEBGPU_PACKAGE = '@remotion/whisper-webgpu';

export const isWhisperWebGpuInstalled = () => {
	return (
		window.remotion_installedPackages?.includes(WHISPER_WEBGPU_PACKAGE) ?? false
	);
};
