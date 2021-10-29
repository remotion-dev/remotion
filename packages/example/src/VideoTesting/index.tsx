import {Sequence, useVideoConfig, Video} from 'remotion';
import videoMp4 from './framer.mp4';
import videoWebm from './framer.webm';

export const VideoTesting: React.FC<{
	codec: 'mp4' | 'webm' | string;
}> = ({codec}) => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			<Sequence from={0} durationInFrames={durationInFrames}>
				<Video src="https://s3.amazonaws.com/combo-compositions-development/uploads/797b04ee-74af-424f-8547-2b9000bcd5e4/AT-cm%7Cch9nFtZAH-OZeNh-cAfCZQ.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAWRLLRLXPRY6O2UOD%2F20211029%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20211029T125551Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=d8c951750d237796187356938ad9ef15f1dad323dc2b2f2689bc3c71c6376c67" />
			</Sequence>
		</div>
	);
};
