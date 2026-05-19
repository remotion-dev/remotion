import {CalculateMetadataFunction} from 'remotion';
import {getMediaMetadata} from './get-media-metadata';

const src = 'https://remotion.media/video-1m.mp4';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {dimensions, fps} = await getMediaMetadata(src);

	return {
		durationInFrames: fps! * 180,
		fps: fps!,
		width: dimensions!.width,
		height: dimensions!.height,
	};
};
