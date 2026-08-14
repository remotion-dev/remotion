import {loadFont} from '@remotion/google-fonts/MonaSans';
import React from 'react';
import {
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const {fontFamily} = loadFont('normal', {
	weights: ['700'],
	subsets: ['latin'],
});

export const SpinningTextWheel: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const values = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday',
	];
	const selectedIndex = 4;
	const progress = spring({
		fps,
		frame,
		config: {
			mass: 10,
			damping: 200,
			stiffness: 200,
		},
		durationInFrames: 90,
		durationRestThreshold: 0.0001,
	});
	const rotation = interpolate(progress, [0, 1], [1, 0]);

	return (
		<Interactive.Div
			name="Spinning text wheel"
			style={{
				color: '#182033',
				fontFamily,
				fontSize: 72,
				fontWeight: 700,
				height: 420,
				lineHeight: 1,
				maskImage:
					'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
				overflow: 'hidden',
				perspective: 1000,
				position: 'relative',
				transformStyle: 'preserve-3d',
				width: 640,
			}}
		>
			{values.map((value, index) => {
				const wheelIndex = index / values.length + rotation;
				const valueIndex = (index + selectedIndex) % values.length;
				const angle = wheelIndex * Math.PI * 2;
				const rotateX = wheelIndex * 360;

				return (
					<div
						key={value}
						style={{
							alignItems: 'center',
							backfaceVisibility: 'hidden',
							display: 'flex',
							height: '100%',
							justifyContent: 'center',
							left: 0,
							opacity:
								valueIndex === selectedIndex
									? interpolate(progress, [0.88, 1], [0.28, 1], {
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										})
									: 0.28,
							position: 'absolute',
							top: 0,
							transform: `translateZ(${Math.cos(angle) * 130}px) translateY(${Math.sin(angle) * 130}px) rotateX(${rotateX}deg)`,
							transformStyle: 'preserve-3d',
							width: '100%',
						}}
					>
						<div
							style={{
								backfaceVisibility: 'hidden',
								textAlign: 'center',
								transform: `rotateX(${-rotateX}deg)`,
								width: '100%',
							}}
						>
							{values[valueIndex]}
						</div>
					</div>
				);
			})}
		</Interactive.Div>
	);
};
