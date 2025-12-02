import {Video} from '@remotion/media';
import {CalculateMetadataFunction, Composition} from 'remotion';
// https://www.remotion.dev/docs/mediabunny/metadata
import {getMediaMetadata} from '../get-media-metadata';

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
	return <Video src={src}  />;
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
