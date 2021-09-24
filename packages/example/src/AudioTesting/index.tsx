import {Audio, interpolate, Sequence} from 'remotion';
import music from './music.mp3';

const AudioTesting: React.FC = () => {
	return (
		<div>
			<Sequence from={50} durationInFrames={100}>
				<Audio
					src={music}
					volume={(f) =>
						interpolate(f, [0, 50, 100], [0, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				>
					<source
						src="https://res.cloudinary.com/arthurdenner/video/upload/v1632482233/Remotion/kid-laugh.mp3"
						type="audio/mpeg"
					/>
					<source
						src="https://res.cloudinary.com/arthurdenner/video/upload/v1632482233/Remotion/cow-moo.ogg"
						type="audio/ogg"
					/>
				</Audio>
			</Sequence>
		</div>
	);
};

export default AudioTesting;
