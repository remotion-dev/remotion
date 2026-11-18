import {CalculateMetadataFunction, Composition, Html5Audio} from 'remotion';
import {getMediaMetadata} from '../get-media-metadata';

const fps = 30;
const src = 'https://remotion.media/multiple-audio-streams.mov';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps),
		fps,
	};
};

const Component = () => {
	return (
		<>
			<Html5Audio src={src} audioStreamIndex={3} />
		</>
	);
};

export const MultiChannelAudio = () => {
	return (
		<Composition
			component={Component}
			id="MultiChannelAudio"
			calculateMetadata={calculateMetadataFn}
			fps={fps}
			width={100}
			height={100}
		/>
	);
};
