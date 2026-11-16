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
			<div style={{position: 'absolute', top: 240, display: 'flex'}}>
				{[1, 0.5].map((alpha) => (
					<div
						key={alpha}
						style={{
							width: 80,
							height: 80,
							backgroundColor: 'blue',
							backgroundImage: `linear-gradient(rgba(255, 0, 0, ${alpha}), rgba(255, 0, 0, ${alpha}))`,
							opacity: 0.5,
						}}
					/>
				))}
				{[
					[0, 0],
					[0, 20],
					[20, 0],
				].map(([width, height]) => (
					<div
						key={`${width}-${height}`}
						style={{
							position: 'relative',
							boxSizing: 'content-box',
							width,
							height,
							padding: 20,
							backgroundClip: 'content-box',
							backgroundColor: 'blue',
							backgroundImage: 'linear-gradient(red, red)',
							backgroundBlendMode: 'multiply',
						}}
					>
						<div
							style={{
								position: 'absolute',
								inset: 5,
								backgroundColor: '#00cc44',
							}}
						/>
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

export const backgroundBlendMode = {
	component: BackgroundBlendMode,
	id: 'background-blend-mode',
	width: 640,
	height: 320,
	fps: 30,
	durationInFrames: 2,
} as const;
