import {Audio, interpolate, Sequence, staticFile} from 'remotion';

const AudioTesting: React.FC = () => {
	return (
		<div>
			<Sequence from={100} durationInFrames={100}>
				<Audio
					startFrom={100}
					endAt={200}
					src={staticFile('music.mp3')}
					volume={(f) =>
						interpolate(f, [0, 50, 100], [0, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				/>
			</Sequence>
		</div>
	);
};

export default AudioTesting;
