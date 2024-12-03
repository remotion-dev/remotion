import {getVideoMetadata} from '@remotion/media-utils';
import {
	CalculateMetadataFunction,
	Loop,
	OffthreadVideo,
	staticFile,
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
		width,
		height,
	};
};

export const LoopedOffthreadVideo: React.FC<{
	durationInFrames: number;
	muted?: boolean;
}> = ({durationInFrames}) => {
	if (durationInFrames <= 0) {
		throw new Error('durationInFrames must be greater than 0');
	}

	return (
		<Loop durationInFrames={durationInFrames}>
			<OffthreadVideo muted src={src} />
		</Loop>
	);
};

export const OffthreadRemoteVideo: React.FC = () => {
	return <LoopedOffthreadVideo durationInFrames={100} />;
};
