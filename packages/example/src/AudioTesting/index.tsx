import {Audio, interpolate, Sequence} from 'remotion';
import music from './music.mp3';

const AudioTesting: React.FC = () => {
	return (
		<div>
			<Sequence from={-200} durationInFrames={300}>
				<Audio
					src={music}
					volume={(f) => interpolate(f, [0, 200, 290, 300], [0, 1, 1, 0])}
				/>
			</Sequence>
		</div>
	);
};

export default AudioTesting;
