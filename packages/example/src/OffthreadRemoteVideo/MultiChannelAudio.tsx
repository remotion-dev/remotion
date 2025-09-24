import {parseMedia} from '@remotion/media-parser';
import {StudioInternals} from '@remotion/studio';
import {Audio, CalculateMetadataFunction} from 'remotion';

const fps = 30;
const src = 'https://remotion.media/multiple-audio-streams.mov';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {slowDurationInSeconds} = await parseMedia({
		src,
		acknowledgeRemotionLicense: true,
		fields: {
			slowDurationInSeconds: true,
		},
	});

	return {
		durationInFrames: Math.round(slowDurationInSeconds * fps),
		fps,
	};
};

const Component = () => {
	return (
		<>
			<Audio src={src} audioStreamIndex={3} />
		</>
	);
};

export const MultiChannelAudio = StudioInternals.createComposition({
	component: Component,
	id: 'MultiChannelAudio',
	calculateMetadata: calculateMetadataFn,
	fps,
	width: 100,
	height: 100,
});
