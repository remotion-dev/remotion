import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Triangle} from './Triangle';

const centered = {
	justifyContent: 'center',
	alignItems: 'center',
};

export const ProductHuntLogo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const scale = (index: number) => {
		return spring({
			frame: frame - index * 10,
			fps,
			config: {
				mass: 2,
				damping: 200,
			},
		});
	};
	return (
		<AbsoluteFill
			style={{...centered, backgroundColor: 'white', transform: `scale(1.3)`}}
		>
			<AbsoluteFill
				style={{
					...centered,
					transform: `scale(${scale(0)})`,
				}}
			>
				<Triangle size={220} opacity={0.2} />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					...centered,
					transform: `scale(${scale(1)})`,
				}}
			>
				<Triangle size={180} opacity={0.4} />
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					...centered,
					transform: `scale(${scale(2)})`,
				}}
			>
				<Triangle size={140} opacity={1} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
