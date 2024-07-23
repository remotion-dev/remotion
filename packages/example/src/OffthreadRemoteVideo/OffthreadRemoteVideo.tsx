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
	const {durationInSeconds, width, height} = await getVideoMetadata(src);

	return {
		durationInFrames: Math.round(durationInSeconds * fps),
		fps,
		width,
		height,
	};
};

export const OffthreadRemoteVideo: React.FC<{
	src: string;
}> = () => {
	return (
		<>
			<OffthreadVideo src="https://d3qebvzk3ie1bc.cloudfront.net/upload/user/a282fed1-b77d-401a-9f77-73217808f737/video/2ec06010-1caa-4c72-8f65-f9e5ce6bd78e.mp4" />
			<OffthreadVideo src="https://d3qebvzk3ie1bc.cloudfront.net/augie/600001/assets/b8398df6-8803-4377-b558-c97317ac0933" />
		</>
	);
};
