import {experimental_Video as NewVideo} from '@remotion/media';
import {
	OffthreadVideo,
	Sequence,
	staticFile,
	useVideoConfig,
	Video,
} from 'remotion';

export const VideoTestingPlayback: React.FC<{
	type?: 'normal' | 'offthread' | 'codec';
}> = ({type = 'normal'}) => {
	const {durationInFrames} = useVideoConfig();
	const videoMp4 = staticFile('framermp4withoutfileextension');

	let Comp;
	if (type === 'codec') {
		Comp = NewVideo;
	} else if (type === 'offthread') {
		Comp = OffthreadVideo;
	} else {
		Comp = Video;
	}

	return (
		<div>
			<Sequence durationInFrames={durationInFrames}>
				<Comp playbackRate={4} src={videoMp4} />
			</Sequence>
		</div>
	);
};
