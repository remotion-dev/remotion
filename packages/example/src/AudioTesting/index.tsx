import {Audio} from 'remotion';
/**
*  Monkeys Spinning Monkeys by Kevin MacLeod
Link: https://incompetech.filmmusic.io/song/4071-monkeys-spinning-monkeys
License: https://filmmusic.io/standard-license
*/
import music from './music.mp3';

const AudioTesting: React.FC = () => {
	return (
		<div>
			<Audio src={music} />
		</div>
	);
};

export default AudioTesting;
