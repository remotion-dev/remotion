import {Video} from '@remotion/media';
import {CalculateMetadataFunction, Composition, staticFile} from 'remotion';
// https://www.remotion.dev/docs/mediabunny/metadata
import {getMediaMetadata} from '../get-media-metadata';

const src = staticFile('road-loop.mp4');

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds, dimensions, fps} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps!) * 4,
		fps: fps!,
		width: dimensions!.width,
		height: dimensions!.height,
	};
};

export const Component = () => {
	return <Video loop src={src} />;
};

export const NewPerfectlyLoopedVideoComp = () => {
	return (
		<Composition
			component={Component}
			id="NewPerfectlyLoopedVideo"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};

// In Root.tsx:
// <NewVideoComp />
