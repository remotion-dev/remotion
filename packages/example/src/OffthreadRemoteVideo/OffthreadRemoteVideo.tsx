import {getVideoMetadata} from '@remotion/media-utils';
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

export const OffthreadRemoteVideo: React.FC = () => {
	return <LoopedOffthreadVideo durationInFrames={100} />;
};
