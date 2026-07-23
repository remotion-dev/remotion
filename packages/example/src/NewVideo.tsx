import {Video} from '@remotion/media';
import {CalculateMetadataFunction, Composition, Sequence} from 'remotion';
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
	return <Video src={src} debugOverlay />;
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

const PremountSequenceVideo = () => {
	return (
		<Sequence from={90} premountFor={30}>
			<Video src={src} debugOverlay />
		</Sequence>
	);
};

export const PremountSequenceVideoComp = () => {
	return (
		<Composition
			id="PremountSequenceVideo"
			component={PremountSequenceVideo}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={180}
		/>
	);
};

// In Root.tsx:
// <NewVideoComp />
