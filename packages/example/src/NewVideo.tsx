import {Audio} from '@remotion/media';
import {CalculateMetadataFunction, Composition} from 'remotion';
// https://www.remotion.dev/docs/mediabunny/metadata
import {staticFile} from 'remotion';
import {getMediaMetadata} from './get-media-metadata';

const src = staticFile('sample-audio.mp3');

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * 30),
		fps: 30,
		width: 1920,
		height: 1080,
	};
};

export const Component = () => {
	return <Audio src={src} />;
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
