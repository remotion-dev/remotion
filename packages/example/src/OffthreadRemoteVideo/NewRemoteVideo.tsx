import {experimental_Video as Video} from '@remotion/media';
import {parseMedia} from '@remotion/media-parser';
import {StudioInternals} from '@remotion/studio';
import {CalculateMetadataFunction, staticFile} from 'remotion';

const fps = 30;
const src = staticFile('bigbuckbunny.mp4') + '#t=lol';

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
			<Video src={src} logLevel="verbose" />
		</>
	);
};

export const NewRemoteVideo = StudioInternals.createComposition({
	component: Component,
	id: 'NewRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
