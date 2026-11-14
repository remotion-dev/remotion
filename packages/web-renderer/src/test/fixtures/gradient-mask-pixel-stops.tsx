import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const gradientMaskPixelModes = [
	'pixel',
	'percent',
	'mixed',
	'double',
	'implicit',
] as const;
export const gradientMaskPixelStops = (
	mode: (typeof gradientMaskPixelModes)[number],
	nativeScale: number | null,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const x = 20 + frame * 3;
		const backgrounds = {
			pixel: `linear-gradient(90deg, transparent ${x}px, black ${x}px, black ${x + 4}px, transparent ${x + 4}px)`,
			percent: `linear-gradient(90deg, transparent ${25 + frame * 5}%, black ${25 + frame * 5}%, black 75%, transparent 75%)`,
			mixed: `linear-gradient(90deg, transparent 0%, transparent ${x}px, black ${x}px, black 75%, transparent 75%)`,
			double: `linear-gradient(90deg, transparent 0px ${x}px, black ${x}px ${x + 4}px, transparent ${x + 4}px 180px)`,
			implicit: `linear-gradient(90deg, black, black ${x}px, transparent ${x}px, transparent)`,
		};
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: 240,
						height: 120,
						transform: `scale(${nativeScale ?? 1})`,
						transformOrigin: '0 0',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 8,
							top: 8,
							width: 180,
							height: 64,
							backgroundColor: '#1373ab',
							maskImage: backgrounds[mode],
						}}
					/>
				</div>
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `gradient-mask-pixel-stops-${mode}-${nativeScale ?? 'export'}`,
		width: 240 * (nativeScale ?? 1),
		height: 120 * (nativeScale ?? 1),
		fps: 30,
		durationInFrames: 2,
	} as const;
};
