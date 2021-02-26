import {Sequence, useVideoConfig, Video} from 'remotion';
// FIXME: commit sample movie
import movie from './movie.webm';

const AudioTesting: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			<Sequence from={0 - 2000} durationInFrames={durationInFrames / 3 + 2000}>
				<Video src={movie} />
			</Sequence>
			<Sequence
				from={(durationInFrames / 3) * 2}
				durationInFrames={durationInFrames / 3}
			>
				<Video src={movie} />
			</Sequence>
		</div>
	);
};

export default AudioTesting;
