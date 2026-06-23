import {Video as NewVideo} from '@remotion/media';
import {
	OffthreadVideo,
	Sequence,
	staticFile,
	useVideoConfig,
	Video,
} from 'remotion';

export const VideoTesting: React.FC<{
	codec: 'mp4' | 'webm';
	type?: 'normal' | 'offthread' | 'codec';
}> = ({codec, type = 'normal'}) => {
	const {durationInFrames} = useVideoConfig();
	const videoMp4 = staticFile('framermp4withoutfileextension');
	const videoWebm = staticFile('framer.webm');

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
			<Sequence
				durationInFrames={durationInFrames}
				from={13}
				style={{
					rotate: '-37.7deg',
					scale: 0.662,
				}}
			>
				<Comp src={codec === 'mp4' ? videoMp4 : videoWebm} />
			</Sequence>
		</div>
	);
};
