import {BrowserSafeApis} from '@remotion/renderer/client';
import type {CloudProvider} from '@remotion/serverless';
import type {RenderMetadata} from '@remotion/serverless/client';

export const lambdaRenderHasAudioVideo = <Provider extends CloudProvider>(
	renderMetadata: RenderMetadata<Provider>,
): {
	hasAudio: boolean;
	hasVideo: boolean;
} => {
	if (renderMetadata.type === 'still') {
		throw new Error('Cannot merge stills');
	}

	const support = BrowserSafeApis.codecSupportsMedia(renderMetadata.codec);

	const hasVideo = renderMetadata
		? !BrowserSafeApis.isAudioCodec(renderMetadata.codec)
		: false;
	const hasAudio = renderMetadata
		? !renderMetadata.muted && support.audio
		: false;

	return {
		hasAudio,
		hasVideo,
	};
};
