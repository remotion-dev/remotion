import {parseMedia} from '@remotion/media-parser';
import {StudioInternals} from '@remotion/studio';
import {CalculateMetadataFunction, OffthreadVideo, staticFile} from 'remotion';

const fps = 30;
const src = staticFile('bigbuckbunny.mp4') + '#t=lol';

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {slowDurationInSeconds, dimensions} = await parseMedia({
		src,
		fields: {
			dimensions: true,
			slowDurationInSeconds: true,
		},
	});
	if (dimensions === null) {
		throw new Error('No video track');
	}

	return {
		durationInFrames: Math.round(slowDurationInSeconds * fps),
		fps,
		width: Math.floor(dimensions.width / 2) * 2,
		height: Math.floor(dimensions.height / 2) * 2,
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
