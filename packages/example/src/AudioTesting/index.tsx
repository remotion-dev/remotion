import {Sequence, useVideoConfig, Video} from 'remotion';
import video from './framer.mp4';

export const AudioTesting: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			<Sequence from={0} durationInFrames={durationInFrames + 40}>
				<Video src={video} />
			</Sequence>
		</div>
	);
};
