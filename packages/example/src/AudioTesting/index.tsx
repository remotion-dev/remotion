import {Audio, Sequence, useVideoConfig} from 'remotion';
/**
*  Monkeys Spinning Monkeys by Kevin MacLeod
Link: https://incompetech.filmmusic.io/song/4071-monkeys-spinning-monkeys
License: https://filmmusic.io/standard-license
*/
import music from './music.mp3';

const AudioTesting: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	return (
		<div>
			<Audio src={music} />
			<Sequence from={0 - 2000} durationInFrames={durationInFrames / 3 + 2000}>
				<Audio src={music} />
			</Sequence>
			<Sequence
				from={(durationInFrames / 3) * 2}
				durationInFrames={durationInFrames / 3}
			>
				<Audio src={music} />
			</Sequence>
		</div>
	);
};

export default AudioTesting;
