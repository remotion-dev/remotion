import {Video} from '@remotion/media';
import {parseMedia} from '@remotion/media-parser';
import {StudioInternals} from '@remotion/studio';
import {CalculateMetadataFunction} from 'remotion';

const fps = 30;
const src = 'https://remotion.media/video.mp4' + '#t=lol';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {slowDurationInSeconds, dimensions} = await parseMedia({
		src,
		acknowledgeRemotionLicense: true,
		fields: {
			slowDurationInSeconds: true,
			dimensions: true,
		},
	});

	return {
		durationInFrames: Math.round(slowDurationInSeconds * fps),
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
