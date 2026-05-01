import {Audio, Video} from '@remotion/media';
import {
	CalculateMetadataFunction,
	Composition,
	Html5Audio,
	Html5Video,
	Sequence,
} from 'remotion';
// https://www.remotion.dev/docs/mediabunny/metadata
import {getMediaMetadata} from './get-media-metadata';

const src = 'https://remotion.media/video.mp4';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds, dimensions, fps} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps!),
		fps: fps!,
		width: dimensions!.width,
		height: dimensions!.height,
	};
};

export const Component = () => {
	return (
		<Sequence>
			<Html5Video src={src} trimBefore={30} trimAfter={40} loop />
		</Sequence>
	);
};

export const NewVideoComp = () => {
	return (
		<Composition
			component={Component}
			id="NewVideo"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};

// In Root.tsx:
// <NewVideoComp />
