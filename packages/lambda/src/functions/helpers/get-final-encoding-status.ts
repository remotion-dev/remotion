import type {EncodingProgress, RenderMetadata} from '../../shared/constants';
import type {LambdaInvokeStats} from './get-lambdas-invoked-stats';

export const getFinalEncodingStatus = ({
	encodingStatus: encodingProgress,
	renderMetadata,
	outputFileExists,
	lambdaInvokeStatus,
}: {
	encodingStatus: EncodingProgress | null;
	renderMetadata: RenderMetadata | null;
	outputFileExists: boolean;
	lambdaInvokeStatus: LambdaInvokeStats;
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
			timeToInvoke: lambdaInvokeStatus.timeToInvokeLambdas,
		};
	}

	return null;
};
