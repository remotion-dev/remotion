import {parseMedia} from '@remotion/media-parser';
import {StudioInternals} from '@remotion/studio';
import {experimental_NewVideo as NewVideo} from '@remotion/video';
import {CalculateMetadataFunction, staticFile} from 'remotion';

const fps = 30;
const src = staticFile('demo_smpte_h264_aac.mp4') + '#t=lol';

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

	if (dimensions === null) {
		throw new Error('Dimensions are null');
	}

	return {
		durationInFrames: Math.round(slowDurationInSeconds * fps),
		fps,
		width: Math.floor(dimensions.width / 2) * 2,
		height: Math.floor(dimensions.height / 2) * 2,
	};
};

const Component = () => {
	return (
		<>
			<NewVideo src={src} />
		</>
	);
};

export const NewVideoExample = StudioInternals.createComposition({
	component: Component,
	id: 'new-video',
	calculateMetadata: calculateMetadataFn,
	fps,
});
