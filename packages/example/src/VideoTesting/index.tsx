import {
	OffthreadVideo,
	Sequence,
	staticFile,
	useVideoConfig,
	Video,
} from 'remotion';

export const VideoTesting: React.FC<{
	codec: 'mp4' | 'webm';
	offthread: boolean;
}> = ({codec, offthread}) => {
	const {durationInFrames} = useVideoConfig();
	const videoMp4 = staticFile('framermp4withoutfileextension');
	const videoWebm = staticFile('framer.webm');

	const Comp = offthread ? OffthreadVideo : Video;

	return (
		<Sequence from={0} durationInFrames={durationInFrames}>
			<Comp src={codec === 'mp4' ? videoMp4 : videoWebm} />
		</Sequence>
	);
};
