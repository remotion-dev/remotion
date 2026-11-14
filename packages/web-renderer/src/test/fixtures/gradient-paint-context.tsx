import {AbsoluteFill, useCurrentFrame} from 'remotion';
export const gradientPaintModes = [
	'scale',
	'quarter-turn',
	'opacity',
	'clip',
] as const;
export const gradientPaintContext = (
	mode: (typeof gradientPaintModes)[number],
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const x = 20 + frame * 4;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div
					style={{
						position: 'absolute',
						left: mode === 'quarter-turn' ? 100 : 20,
						top: 20,
						width: 120,
						height: 40,
						transform:
							mode === 'scale'
								? 'scale(2)'
								: mode === 'quarter-turn'
									? 'rotate(90deg)'
									: undefined,
						transformOrigin: '0 0',
						opacity: mode === 'opacity' ? 0.75 : 1,
						overflow: mode === 'clip' ? 'hidden' : 'visible',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: 120,
							height: 40,
							backgroundColor: '#247da8',
							backgroundImage: `linear-gradient(90deg, transparent ${x}px, red ${x}px, red ${x + 4}px, transparent ${x + 4}px)`,
						}}
					/>
				</div>
			</AbsoluteFill>
		);
	};

	return {
		id: `gradient-paint-context-${mode}`,
		component: Component,
		width: 320,
		height: 200,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
