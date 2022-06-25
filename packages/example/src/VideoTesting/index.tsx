import {
	OffthreadVideo,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	Video,
} from 'remotion';

export const VideoTesting: React.FC<{
	codec: 'mp4' | 'webm';
	offthread: boolean;
}> = ({codec, offthread}) => {
	const {durationInFrames} = useVideoConfig();
	const videoMp4 = staticFile('./framer.mp4');
	const videoWebm = staticFile('./framer.webm');

	const Comp = offthread ? OffthreadVideo : Video;

	console.log(JSON.stringify({frame: useCurrentFrame()}));
	return (
		<div>
			<Sequence from={0} durationInFrames={durationInFrames}>
				<Comp src={codec === 'mp4' ? videoMp4 : videoWebm} />
			</Sequence>
		</div>
	);
};
