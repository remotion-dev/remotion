import {Audio, interpolate, Sequence} from 'remotion';

const AudioTesting: React.FC = () => {
	return (
		<div>
			<Sequence from={50} durationInFrames={100}>
				<Audio
					volume={(f) =>
						interpolate(f, [0, 50, 100], [0, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				>
					{/* Serve this assets with `npm run serve` in the `example` folder */}
					<source src="http://127.0.0.1:8080/cow-moo.ogg" type="audio/ogg" />
					<source src="http://127.0.0.1:8080/kid-laugh.mp3" type="audio/mpeg" />
				</Audio>
			</Sequence>
		</div>
	);
};

export default AudioTesting;
