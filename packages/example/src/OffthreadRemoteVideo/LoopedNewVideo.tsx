import {Video} from '@remotion/media';
import {CalculateMetadataFunction, Composition} from 'remotion';
// https://www.remotion.dev/docs/mediabunny/metadata
import {getMediaMetadata} from '../get-media-metadata';

const src = 'https://remotion.media/video-1m.mp4';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {dimensions, fps} = await getMediaMetadata(src);

	return {
		durationInFrames: fps! * 180,
		fps: fps!,
		width: dimensions!.width,
		height: dimensions!.height,
	};
};

export const Component = () => {
	return <Video src={src} trimBefore={90} trimAfter={60 * 30} loop />;
};

export const LoopedNewVideo = () => {
	return (
		<Composition
			component={Component}
			id="LoopedNewVideo"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};

// In Root.tsx:
// <LoopedNewVideo />
