import {getVideoMetadata} from '@remotion/media-utils';
import {StudioInternals} from '@remotion/studio';
import {CalculateMetadataFunction, OffthreadVideo, staticFile} from 'remotion';

const fps = 30;
const src = staticFile('bigbuckbunny.mp4') + '#t=lol';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds, width, height} = await getVideoMetadata(src);
	console.log({durationInSeconds});

	return {
		durationInFrames: Math.round(durationInSeconds * fps),
		fps,
		width: Math.floor(width / 2) * 2,
		height: Math.floor(height / 2) * 2,
	};
};

export const OffthreadRemoteVideo = StudioInternals.createComposition({
	component: () => {
		return (
			<>
				<OffthreadVideo src={src} />
				<OffthreadVideo src={staticFile('iphonevideo.mov')} />
			</>
		);
	},
	id: 'OffthreadRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
