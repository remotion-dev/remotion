import {Gif} from '@remotion/gif';
import {Player} from '@remotion/player';
import './Counter.css';

const Comp: React.FC = () => {
	return (
		<div>
			<Gif
				src="https://media.giphy.com/media/xT0GqH01ZyKwd3aT3G/giphy.gif"
				fit="cover"
				height={200}
				width={200}
			/>
		</div>
	);
};

export default function Counter() {
	return (
		<>
			<Player
				component={Comp}
				durationInFrames={100}
				compositionWidth={400}
				compositionHeight={400}
				fps={30}
				controls
			></Player>
		</>
	);
}
