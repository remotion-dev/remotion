import {Video as NewVideo} from '@remotion/media';
import {
	OffthreadVideo,
	Sequence,
	staticFile,
	useVideoConfig,
	Video,
} from 'remotion';

export const VideoTestingTrim: React.FC<{
	type?: 'normal' | 'offthread' | 'codec';
}> = ({type = 'normal'}) => {
	const {durationInFrames} = useVideoConfig();
	const videoMp4 = staticFile('framermp4withoutfileextension');

	return (
		<div>
			<Sequence
				durationInFrames={durationInFrames}
				style={{
					scale: 0.601,
					translate: '6.9px 62.5px',
					rotate: '-168.7deg',
				}}
				from={7}
			>
				{type === 'codec' ? (
					<NewVideo
						trimBefore={42}
						trimAfter={95}
						src={videoMp4}
						durationInFrames={55}
						from={-2}
					/>
				) : type === 'offthread' ? (
					<OffthreadVideo trimBefore={20} trimAfter={80} src={videoMp4} />
				) : (
					<Video trimBefore={20} trimAfter={80} src={videoMp4} />
				)}
			</Sequence>
		</div>
	);
};
