import {CalculateMetadataFunction} from 'remotion';
import {getMediaMetadata} from '../get-media-metadata';

const src = 'https://remotion.media/dialogue.wav';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * 30),
		fps: 30,
		width: 100,
		height: 100,
	};
};
