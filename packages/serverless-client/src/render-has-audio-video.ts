import {NoReactAPIs} from '@remotion/renderer/pure';
import type {RenderMetadata} from './render-metadata';
import type {CloudProvider} from './types';

export const lambdaRenderHasAudioVideo = <Provider extends CloudProvider>(
	renderMetadata: RenderMetadata<Provider>,
): {
	hasAudio: boolean;
	hasVideo: boolean;
} => {
	if (renderMetadata.type === 'still') {
		throw new Error('Cannot merge stills');
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
