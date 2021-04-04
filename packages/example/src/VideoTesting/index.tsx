import {Sequence, useVideoConfig, Video} from 'remotion';
import video from './framer.webm';

export const VideoTesting: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			<Sequence from={0} durationInFrames={durationInFrames}>
				<Video src={video} />
			</Sequence>
		</div>
	);
};
