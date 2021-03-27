import {Audio, Sequence, useVideoConfig} from 'remotion';
import music from './music.mp3';

const AudioTesting: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			<Sequence from={-200} durationInFrames={300}>
				<Audio src={music} />
			</Sequence>
		</div>
	);
};

export default AudioTesting;
