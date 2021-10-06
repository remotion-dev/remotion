import {EncodingProgress, RenderMetadata} from '../../shared/constants';

export const getFinalEncodingStatus = ({
	encodingStatus: encodingProgress,
	renderMetadata,
	outputFileExists,
}: {
	encodingStatus: EncodingProgress | null;
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
			totalFrames: renderMetadata.videoConfig.durationInFrames,
			doneIn: null,
		};
	}

	return null;
};
