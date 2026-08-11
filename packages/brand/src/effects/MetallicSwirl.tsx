import {AbsoluteFill, Solid, useCurrentFrame, useVideoConfig} from 'remotion';
import {metallicSwirl} from './metallic-swirl-effect';

export const MetallicSwirl: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	return (
		<AbsoluteFill>
			<Solid
				width={width}
				height={height}
				color="#000000"
				effects={[
					metallicSwirl({
						time: frame / fps,
						speed: 1.15,
						zoom: 6,
						iterations: 12,
						sampleGap: 0.095,
						tangentForce: 0.75,
						gradientForce: 0.15,
						colorRange: 1.05,
						colorBias: 0.7,
						colorA: '#ff0038',
						colorB: '#0047ff',
						brightness: 1.5,
						backgroundColor: '#000000',
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
