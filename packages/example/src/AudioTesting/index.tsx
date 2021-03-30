import {Audio, interpolate, Sequence} from 'remotion';
import music from './music.mp3';

const AudioTesting: React.FC = () => {
	return (
		<div>
			<Sequence from={-200} durationInFrames={290}>
				<Audio
					src={music}
					volume={(f) => interpolate(f, [200, 250, 300], [0, 1, 0])}
				/>
			</Sequence>
		</div>
	);
};

export default AudioTesting;
