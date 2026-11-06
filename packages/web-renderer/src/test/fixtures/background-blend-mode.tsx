import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {blendModes} from './mix-blend-mode';

const BackgroundBlendMode: React.FC = () => {
	const rgb = useCurrentFrame() === 0 ? '220, 90, 40' : '20, 200, 100';
	return (
		<AbsoluteFill>
			{[0, 1, 2].map((row) => (
				<div
					key={row}
					style={{
						position: 'absolute',
						top: row * 80,
						display: 'flex',
						backgroundColor: '#ffc040',
					}}
				>
					{['normal', ...blendModes].map((mode) => (
						<div
							key={mode}
							style={{
								position: 'relative',
								width: 40,
								height: 80,
								backgroundColor:
									row === 1 ? 'rgba(50, 120, 200, 0.5)' : 'rgb(50, 120, 200)',
								backgroundImage:
									row === 1
										? `linear-gradient(rgba(${rgb}, 0.5), rgba(${rgb}, 0.5))`
										: `linear-gradient(rgb(${rgb}), rgb(${rgb}))`,
								backgroundBlendMode: mode,
							}}
						>
							{row === 2 ? (
								<div
									style={{
										position: 'absolute',
										inset: 10,
										background: '#00cc44',
									}}
								/>
							) : null}
						</div>
					))}
				</div>
			))}
		</AbsoluteFill>
	);
};

export const backgroundBlendMode = {
	component: BackgroundBlendMode,
	id: 'background-blend-mode',
	width: 640,
	height: 240,
	fps: 30,
	durationInFrames: 2,
} as const;
