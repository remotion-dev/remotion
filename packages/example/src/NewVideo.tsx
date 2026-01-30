import {Video} from '@remotion/media';
import {CalculateMetadataFunction, Composition} from 'remotion';
// https://www.remotion.dev/docs/mediabunny/metadata
import {getMediaMetadata} from './get-media-metadata';

const src =
	'https://embed-ssl.wistia.com/deliveries/d8e3c219b54f35857e13b562bc9961e3.bin';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds, dimensions, fps} = await getMediaMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * 30),
		fps: 30,
		width: dimensions!.width,
		height: dimensions!.height,
	};
};

export const Component = () => {
	return <Video src={src} />;
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
