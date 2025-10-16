import {Video} from '@remotion/media';
import {StudioInternals} from '@remotion/studio';
import {CalculateMetadataFunction} from 'remotion';
import {getMediaMetadata} from '../get-media-metadata';

const fps = 30;
const src = 'https://remotion.media/video.mp4' + '#t=lol';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds, dimensions} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps),
		fps,
		width: dimensions?.width ?? 100,
		height: dimensions?.height ?? 100,
	};
};

const Component = () => {
	return (
		<>
			<Video src={src} />
		</>
	);
};

export const NewRemoteVideo = StudioInternals.createComposition({
	component: Component,
	id: 'NewRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
