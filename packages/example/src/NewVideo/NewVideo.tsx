import {experimental_Video as NewVideo} from '@remotion/media';
import {StudioInternals} from '@remotion/studio';
import {CalculateMetadataFunction, staticFile} from 'remotion';

const fps = 30;
const src = staticFile('monkey-documentary.mp4') + '#t=lol';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const slowDurationInSeconds = 2880.0806349206346;

	return {
		durationInFrames: Math.round(slowDurationInSeconds * fps),
		fps,
		width: 1920,
		height: 1080,
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
