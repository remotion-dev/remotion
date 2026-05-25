import {AbsoluteFill, Html5Audio, Series} from 'remotion';
import music from '../resources/sound1.mp3';

export const ComplexSounds: React.FC = () => {
	return (
		<AbsoluteFill>
			<Html5Audio src={music} volume={0.3} />
			<Series>
				<Series.Sequence durationInFrames={60}>
					<Html5Audio src="https://remotion.media/sounds/1.wav" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={60}>
					<Html5Audio src="https://remotion.media/sounds/2.wav" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={30}>
					<Html5Audio src="https://remotion.media/sounds/3.wav" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<Html5Audio src="https://remotion.media/sounds/4.wav" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={120}>
					<Html5Audio src="https://remotion.media/sounds/5.wav" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<Html5Audio src="https://remotion.media/sounds/6.wav" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<Html5Audio src="https://remotion.media/sounds/7.wav" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={90}>
					<Html5Audio src="https://remotion.media/sounds/8.wav" />
				</Series.Sequence>
				<Series.Sequence durationInFrames={100}>
					<Html5Audio src="https://remotion.media/sounds/9.wav" />
				</Series.Sequence>
			</Series>
		</AbsoluteFill>
	);
};
