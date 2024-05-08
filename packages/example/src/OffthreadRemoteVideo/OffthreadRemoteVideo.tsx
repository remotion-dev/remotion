import {getVideoMetadata} from '@remotion/media-utils';
import {CalculateMetadataFunction, OffthreadVideo} from 'remotion';

type Props = {
	src: string;
};

const fps = 30;

export const calculateMetadataFn: CalculateMetadataFunction<Props> = async ({
	props,
}) => {
	const {src} = props;
	const duration = await getVideoMetadata(src);

	return {
		durationInFrames: duration.durationInSeconds * fps,
		fps,
	};
};

export const OffthreadRemoteVideo: React.FC<{
	src: string;
}> = ({src}) => {
	return <OffthreadVideo src={src} />;
};
