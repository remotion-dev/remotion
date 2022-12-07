import type {EncodingProgress, RenderMetadata} from '../../shared/constants';

export const getFinalEncodingStatus = ({
	encodingProgress,
	renderMetadata,
	outputFileExists,
}: {
	encodingProgress: EncodingProgress | null;
	renderMetadata: RenderMetadata | null;
	outputFileExists: boolean;
}): EncodingProgress | null => {
	if (!renderMetadata) {
		return null;
	}

	if (encodingProgress) {
		return encodingProgress;
	}

	if (outputFileExists) {
		return {
			framesEncoded: renderMetadata.videoConfig.durationInFrames,
		};
	}

	return null;
};
