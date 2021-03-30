import {Audio, Sequence} from 'remotion';
import music from './music.mp3';

const AudioTesting: React.FC = () => {
	return (
		<div>
			<Audio
				startAt={100}
				endAt={200}
				src={music}
				volume={(f) => (Math.sin(f / 3) + 1) / 2}
			/>
			<Sequence from={0} durationInFrames={100}>
				<Audio src={music} volume={(f) => f / 100} />
			</Sequence>
		</div>
	);
};

export default AudioTesting;
