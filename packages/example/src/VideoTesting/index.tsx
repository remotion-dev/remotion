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
				<Video src={codec === 'mp4' ? videoMp4 : videoWebm} />
			</Sequence>
		</div>
	);
};
