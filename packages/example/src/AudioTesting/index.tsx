import {Audio, getStaticFiles, interpolate, Sequence} from 'remotion';

const AudioTesting: React.FC = () => {
	const files = getStaticFiles();
	const music = files.find((f) => f.name.startsWith('music.mp3'));

	return (
		<div>
			<Sequence from={100} durationInFrames={100}>
				<Audio
					loop
					startFrom={100}
					endAt={200}
					src={music?.src}
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
