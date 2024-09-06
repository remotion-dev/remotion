export type VideoOperation = 'reencode' | 'copy' | 'drop';

export const resolveVideoAction = ({
	videoDecoderConfig,
	videoEncoderConfig,
}: {
	videoDecoderConfig: VideoDecoderConfig | null;
	videoEncoderConfig: VideoEncoderConfig | null;
}): Promise<VideoOperation> => {
	// TODO: Unhardcode and allow user to config
	if (videoDecoderConfig === null || videoEncoderConfig === null) {
		return Promise.resolve('drop');
	}

	return Promise.resolve('reencode');
};
