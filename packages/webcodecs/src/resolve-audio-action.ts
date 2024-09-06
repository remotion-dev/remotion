export type AudioOperation = 'reencode' | 'copy' | 'drop';

export const resolveAudioAction = ({
	audioDecoderConfig,
	audioEncoderConfig,
}: {
	audioDecoderConfig: AudioDecoderConfig | null;
	audioEncoderConfig: AudioEncoderConfig | null;
}): Promise<AudioOperation> => {
	// TODO: Unhardcode and allow user to config
	if (audioDecoderConfig === null || audioEncoderConfig === null) {
		return Promise.resolve('drop');
	}

	return Promise.resolve('reencode');
};
