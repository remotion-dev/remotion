import {registerProresDecoder} from '@mediabunny/prores';
import {Video} from '@remotion/media';
import {CalculateMetadataFunction} from 'remotion';
import {getMediaMetadata} from './get-media-metadata';

const src = 'https://remotion.media/video-prores.mkv';

registerProresDecoder();

export const calculateProResMediaVideoMetadata: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds, dimensions, fps} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps!),
		fps: fps!,
		width: dimensions!.width,
		height: dimensions!.height,
	};
};

export const ProResMediaVideo = () => {
	return <Video src={src} debugOverlay />;
};
