import {Sequence, useVideoConfig, Video,Freeze} from 'remotion';
import videoMp4 from './framer.mp4';
import videoWebm from './framer.webm';

export const VideoTesting: React.FC<{
	codec: 'mp4' | 'webm';
}> = ({codec}) => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			<Sequence from={0} durationInFrames={50}>
				<Video src={codec === 'mp4' ? videoMp4 : videoWebm} />
			</Sequence>
			<Sequence from={50} durationInFrames={durationInFrames}>
				<Freeze frame={50}>
					<Video startFrom={50} src={codec === 'mp4' ? videoMp4 : videoWebm} />
				</Freeze>
			</Sequence>
		</div>
	);
};
