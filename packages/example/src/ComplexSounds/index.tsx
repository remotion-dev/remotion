import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import music from '../resources/sound1.mp3';

export const ComplexSounds: React.FC = () => {
	return (
		<AbsoluteFill>
			<Audio src={music} volume={0.3} />
			<Series>
				<Series.Sequence durationInFrames={60}>
					<Audio src={staticFile('sounds/1.wav')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={60}>
					<Audio src={staticFile('sounds/2.wav')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={30}>
					<Audio src={staticFile('sounds/3.wav')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<Audio src={staticFile('sounds/4.wav')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={120}>
					<Audio src={staticFile('sounds/5.wav')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<Audio src={staticFile('sounds/6.wav')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<Audio src={staticFile('sounds/7.wav')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<Audio src={staticFile('sounds/8.wav')} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={100}>
					<Audio src={staticFile('sounds/9.wav')} />
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
