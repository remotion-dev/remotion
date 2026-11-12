import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const gradientPixelModes = [
	'horizontal',
	'vertical',
	'mixed',
	'implicit',
	'double',
	'reversed',
	'negative',
	'outside',
	'tile',
	'percent-control',
] as const;
export const gradientPixelStops = (
	mode: (typeof gradientPixelModes)[number],
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const position = 100 + frame * 4;
		const backgrounds = {
			horizontal: `linear-gradient(90deg, transparent ${position}px, red ${position}px, red ${position + 4}px, transparent ${position + 4}px)`,
			vertical: `linear-gradient(180deg, transparent ${position}px, red ${position}px, red ${position + 4}px, transparent ${position + 4}px)`,
			mixed:
				'linear-gradient(90deg, transparent 0%, transparent 60px, red 60px, red 75%, transparent 75%, transparent 100%)',
			implicit: 'linear-gradient(90deg, red, red 60px, blue 60px, blue)',
			double:
				'linear-gradient(90deg, transparent 0px 20px, red 20px 24px, transparent 24px 180px)',
			reversed: 'linear-gradient(90deg, red 100px, blue 20px)',
			negative:
				'linear-gradient(90deg, red -20px, red 20px, blue 20px, blue 200px)',
			outside:
				'linear-gradient(90deg, red 200px, red 220px, blue 220px, blue 240px)',
			tile: `linear-gradient(90deg, transparent ${20 + frame * 4}px, red ${20 + frame * 4}px, red ${24 + frame * 4}px, transparent ${24 + frame * 4}px)`,
			'percent-control':
				'linear-gradient(90deg, transparent 0%, transparent 50%, red 50%, red 75%, transparent 75%, transparent 100%)',
		};
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div
					style={{
						position: 'absolute',
						left: 10,
						top: 10,
						width:
							mode === 'vertical'
								? 40
								: mode === 'outside'
									? 180 + frame * 60
									: 180 + frame * 20,
						height: mode === 'vertical' ? 180 + frame * 20 : 40,
						backgroundImage: backgrounds[mode],
						backgroundRepeat: 'no-repeat',
						backgroundSize: mode === 'tile' ? '90px 40px' : 'auto',
						backgroundPosition: mode === 'tile' ? '30px 0px' : '0px 0px',
					}}
				/>
			</AbsoluteFill>
		);
	};

	return {
		id: `gradient-pixel-stops-${mode}`,
		component: Component,
		width: 260,
		height: 240,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
