import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const missingFilterBackgroundSources = [
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAYAAAA16j4lAAAAfUlEQVR4nO3RIQ4AMAwDsf7/0x0fmzR0MjAJCLmZ2f3pHn7/80rgOIHjBI4TOE7gOIHjBI4TOE7gOIHjBI4TOE7gOIHjBI4TOE7gOIHjBI4TOE7gOIHjBI4TOE7gOIHjBI4TOE7gOIHjBI4TOE7gOIHjBI4TOE7gOIHjBE47Qz1crMhvBNMAAAAASUVORK5CYII=',
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAoCAYAAAA16j4lAAAAfElEQVR4nO3RIRIAMAzDsP7/0xsvL/EJiIQEeGbeu7SH6z82geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM47QNDPVys2prYngAAAABJRU5ErkJggg==',
] as const;
export const missingFilterBackgroundEffects = [
	'plain',
	'opacity',
	'filter',
] as const;

export const backgroundImageMissingFilter = (
	effect: (typeof missingFilterBackgroundEffects)[number],
	scale: number,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<div
					style={{
						position: 'absolute',
						left: 20,
						top: 20,
						width: 120,
						height: 40,
						transform: `scale(${scale})`,
						transformOrigin: '0 0',
						backgroundColor: 'blue',
						backgroundImage: `url("${missingFilterBackgroundSources[frame]}")`,
						backgroundSize: '120px 40px',
						backgroundRepeat: 'no-repeat',
						imageRendering: 'pixelated',
						opacity: effect === 'opacity' ? 0.5 : 1,
						filter: effect === 'filter' ? 'opacity(0.5)' : 'none',
					}}
				/>
			</AbsoluteFill>
		);
	};

	return {
		id: `background-image-missing-filter-${effect}-${scale}`,
		component: Component,
		width: 320,
		height: 160,
		fps: 30,
		durationInFrames: 2,
	} as const;
};
