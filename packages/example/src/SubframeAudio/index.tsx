import {Audio} from '@remotion/media';
import {AbsoluteFill, Series, staticFile, useCurrentFrame} from 'remotion';

export const SubframeAudio: React.FC = () => {
	const frame = useCurrentFrame();
	const sine = staticFile('sine-wave.wav');
	const square = staticFile('square-wave.wav');

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#111',
				color: 'white',
				fontFamily: 'sans-serif',
				fontSize: 40,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Series>
				<Series.Sequence durationInFrames={23.5}>
					<Audio src={sine} />
				</Series.Sequence>
				<Series.Sequence durationInFrames={20}>
					<Audio src={square} />
				</Series.Sequence>
			</Series>
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					color: 'red',
					fontSize: 60,
				}}
			>
				{frame}
			</div>
		</AbsoluteFill>
	);
};
