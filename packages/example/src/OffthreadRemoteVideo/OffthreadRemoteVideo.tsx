import {StudioInternals} from '@remotion/studio';
import {CalculateMetadataFunction, OffthreadVideo} from 'remotion';
import {getMediaMetadata} from '../get-media-metadata';

const fps = 30;
const src = 'https://remotion.media/bigbuckbunny.mp4#t=lol';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds, dimensions} = await getMediaMetadata(src);

	if (dimensions === null) {
		throw new Error('Dimensions are null');
	}

	return {
		durationInFrames: Math.round(durationInSeconds * fps),
		fps,
		width: Math.floor(dimensions.width / 2) * 2,
		height: Math.floor(dimensions.height / 2) * 2,
	};
};

const Component = () => {
	return (
		<>
			<OffthreadVideo src={src} />
		</>
	);
};

export const OffthreadRemoteVideo = StudioInternals.createComposition({
	component: Component,
	id: 'OffthreadRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
