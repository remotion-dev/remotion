import {CalculateMetadataFunction, Composition, Html5Video} from 'remotion';
// https://www.remotion.dev/docs/mediabunny/metadata
import {Video} from '@remotion/media';
import {getMediaMetadata} from './get-media-metadata';

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
	return (
		<>
			<Html5Video
				src={src}
				trimBefore={90}
				trimAfter={60 * 30}
				playbackRate={0.5}
				loop
				name="Html5Video"
				style={{width: '50%'}}
			/>
			<Video
				src={src}
				trimBefore={90}
				trimAfter={60 * 30}
				playbackRate={0.5}
				loop
				name="MediaVideo"
				style={{width: '50%'}}
			/>
		</>
	);
};

export const LoopDisplayTestComp = () => {
	return (
		<Composition
			component={Component}
			id="LoopDisplayTest"
			calculateMetadata={calculateMetadataFn}
		/>
	);
};
