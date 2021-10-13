import {Sequence, useVideoConfig, Video} from 'remotion';
import videoMp4 from '../VideoTesting/framer.mp4';
import videoWebm from '../VideoTesting/framer.webm';

export const SourceTesting: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			<Sequence from={0} durationInFrames={durationInFrames}>
				<Video>
					<source src={videoMp4} type="video/mp4" />
					<source src={videoWebm} type="video/webm" />
				</Video>
			</Sequence>
		</div>
	);
};
