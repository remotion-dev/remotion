import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const AnimatedLetter: React.FC<{
	letter: string;
	delay: number;
}> = ({letter, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		frame: frame - delay,
		fps,
		config: {
			damping: 20,
			stiffness: 100,
		},
	});

	const rotateX = interpolate(progress, [0, 1], [90, 0]);
	const opacity = interpolate(progress, [0, 0.5, 1], [0, 0.5, 1]);
	const translateY = interpolate(progress, [0, 1], [20, 0]);

	return (
		<span
			style={{
				display: 'inline-block',
				transform: `perspective(1000px) rotateX(${rotateX}deg) translateY(${translateY}px)`,
				opacity,
				transformStyle: 'preserve-3d',
				marginRight: letter === ' ' ? '0.3em' : '0',
			}}
		>
			{letter === ' ' ? '\u00A0' : letter}
		</span>
	);
};

export const BrandName: React.FC = () => {
	const text = 'KIRAN VOLETI';
	const letters = text.split('');

	return (
		<div
			style={{
				fontFamily: 'Inter, Arial, sans-serif',
				fontSize: '72px',
				fontWeight: 'bold',
				color: 'white',
				letterSpacing: '0.05em',
				textAlign: 'center',
				textShadow: '0 0 20px rgba(167, 139, 250, 0.5)',
			}}
		>
			{letters.map((letter, i) => (
				<AnimatedLetter
					key={i}
					letter={letter}
					delay={150 + i * 3} // Start at frame 150 (2.5s), stagger by 3 frames
				/>
			))}
		</div>
	);
};
