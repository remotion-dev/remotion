import {getVideoMetadata} from '@remotion/media-utils';
import {CalculateMetadataFunction, Loop, OffthreadVideo} from 'remotion';

type Props = {
	src: string;
};

const fps = 30;

export const calculateMetadataFn: CalculateMetadataFunction<Props> = async ({
	props,
}) => {
	const {src} = props;
	const {durationInSeconds, width, height} = await getVideoMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps),
		fps,
		width: width * 2,
		height,
	};
};

export const LoopedOffthreadVideo: React.FC<{
	durationInFrames: number;
	src: string;
	muted?: boolean;
}> = ({durationInFrames, src}) => {
	if (durationInFrames <= 0) {
		throw new Error('durationInFrames must be greater than 0');
	}

	return (
		<Loop durationInFrames={durationInFrames}>
			<OffthreadVideo muted src={src} />
		</Loop>
	);
};

export const OffthreadRemoteVideo: React.FC<{
	src: string;
}> = ({src}) => {
	return <LoopedOffthreadVideo durationInFrames={100} src={src} />;
};
