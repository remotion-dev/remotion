import type {Codec} from './codec';
import {isAudioCodec} from './is-audio-codec';

export const canUseParallelEncoding = (codec: Codec) => {
	if (getShouldUsePartitionedRendering()) {
		return false;
	}

	if (isAudioCodec(codec)) {
		return false;
	}

	return codec === 'h264' || codec === 'h264-mkv' || codec === 'h265';
};

export const getShouldUsePartitionedRendering = () => {
	const shouldUsePartitionedRendering =
		process.env.REMOTION_PARTITIONED_RENDERING === 'true';
	return shouldUsePartitionedRendering;
};
