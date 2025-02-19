import {parseMedia} from '@remotion/media-parser';
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

export const LoopedOffthreadRemoteVideo = StudioInternals.createComposition({
	component: () => {
		return <LoopedOffthreadVideo durationInFrames={100} />;
	},
	id: 'LoopedOffthreadRemoteVideo',
	calculateMetadata: calculateMetadataFn,
	fps,
});
