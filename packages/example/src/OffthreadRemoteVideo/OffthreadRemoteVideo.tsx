import {getVideoMetadata} from '@remotion/media-utils';
import {StudioInternals} from '@remotion/studio';
import {
	AbsoluteFill,
	CalculateMetadataFunction,
	OffthreadVideo,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const fps = 30;
const src = staticFile('bigbuckbunny.mp4');

export const calculateMetadataFn: CalculateMetadataFunction<
	Record<string, unknown>
> = async () => {
	const {durationInSeconds, width, height} = await getVideoMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps),
		fps,
		width: Math.floor(width / 2) * 2,
		height: Math.floor(height / 2) * 2,
	};
};

export const LoopedOffthreadVideo: React.FC<{
	durationInFrames: number;
	muted?: boolean;
}> = ({durationInFrames}) => {
	const frame = useCurrentFrame();
	if (durationInFrames <= 0) {
		throw new Error('durationInFrames must be greater than 0');
	}

	return (
		<AbsoluteFill style={{backgroundColor: 'green'}}>
			<OffthreadVideo muted transparent={frame % 2 === 0} src={src} />
		</AbsoluteFill>
	);
};

export const OffthreadRemoteVideo = StudioInternals.createComposition({
	component: () => {
		return <OffthreadVideo src={src} />;
	},
	id: 'OffthreadRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});

export const LoopedOffthreadRemoteVideo = StudioInternals.createComposition({
	component: () => {
		return <LoopedOffthreadVideo durationInFrames={100} />;
	},
	id: 'LoopedOffthreadRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
