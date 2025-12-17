import {
	canEncodeAudio,
	QUALITY_MEDIUM,
	type AudioEncodingConfig,
} from 'mediabunny';

export const getDefaultAudioEncodingConfig = async () => {
	const preferredDefaultAudioEncodingConfig: AudioEncodingConfig = {
		codec: 'aac',
		bitrate: QUALITY_MEDIUM,
	};
	if (
		await canEncodeAudio(
			preferredDefaultAudioEncodingConfig.codec,
			preferredDefaultAudioEncodingConfig,
		)
	) {
		return preferredDefaultAudioEncodingConfig;
	}

	const backupDefaultAudioEncodingConfig: AudioEncodingConfig = {
		codec: 'opus',
		bitrate: QUALITY_MEDIUM,
	};

	if (
		await canEncodeAudio(
			backupDefaultAudioEncodingConfig.codec,
			backupDefaultAudioEncodingConfig,
		)
	) {
		return backupDefaultAudioEncodingConfig;
	}

	return null;
};
