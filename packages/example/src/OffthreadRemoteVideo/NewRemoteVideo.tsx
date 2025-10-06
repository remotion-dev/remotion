import {Audio} from '@remotion/media';
import {parseMedia} from '@remotion/media-parser';
import {StudioInternals} from '@remotion/studio';
import {CalculateMetadataFunction, staticFile} from 'remotion';

const fps = 30;
const src = staticFile('audio-48000hz.wav') + '#t=lol';

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
		width: 100,
		height: 100,
	};
};

const Component = () => {
	return (
		<>
			<Audio src={src} toneFrequency={0.9} />
		</>
	);
};

export const NewRemoteVideo = StudioInternals.createComposition({
	component: Component,
	id: 'NewRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
