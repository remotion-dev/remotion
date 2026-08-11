import {Video} from '@remotion/media';
import React from 'react';
import {CalculateMetadataFunction, Composition} from 'remotion';
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

const Component: React.FC = () => {
	return <Video src={src} debugOverlay logLevel="verbose" />;
};

export const AudioSmoothnessNewVideoComp: React.FC = () => {
	return (
		<Composition
			component={Component}
			id="audio-smoothness-new-video"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};
