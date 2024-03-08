import {RenderInternals} from '@remotion/renderer';
import type {RenderMetadata} from '../../defaults';

export const lambdaRenderHasAudioVideo = (
	renderMetadata: RenderMetadata,
): {
	hasAudio: boolean;
	hasVideo: boolean;
} => {
	if (renderMetadata.type === 'still') {
		throw new Error('Cannot merge stills');
	}

	const hasVideo = renderMetadata
		? !RenderInternals.isAudioCodec(renderMetadata.codec)
		: false;
	const hasAudio = renderMetadata ? !renderMetadata.muted : false;

	return {
		hasAudio,
		hasVideo,
	};
};
