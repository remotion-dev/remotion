import {NoReactAPIs} from '@remotion/renderer/pure';
import type {RenderMetadata} from './render-metadata';

export const lambdaRenderHasAudioVideo = (
	renderMetadata: RenderMetadata,
): {
	hasAudio: boolean;
	hasVideo: boolean;
} => {
	if (renderMetadata.type === 'still') {
		throw new Error('Cannot merge stills');
	}

	if (renderMetadata.type === 'sequence') {
		return {hasAudio: false, hasVideo: true};
	}

	const support = NoReactAPIs.codecSupportsMedia(renderMetadata.codec);

	const hasVideo = renderMetadata
		? !NoReactAPIs.isAudioCodec(renderMetadata.codec)
		: false;
	const hasAudio = renderMetadata
		? !renderMetadata.muted && support.audio
		: false;

	return {
		hasAudio,
		hasVideo,
	};
};
