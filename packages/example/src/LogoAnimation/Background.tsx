import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

export const Background: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();

	const stars = useMemo(() => {
		const numStars = 150;
		return Array.from({length: numStars}, (_, i) => {
			const seed = i * 123.456;
			return {
				x: (Math.sin(seed) * 0.5 + 0.5) * width,
				y: (Math.cos(seed * 1.3) * 0.5 + 0.5) * height,
				size: Math.abs(Math.sin(seed * 2.1)) * 2 + 0.5,
				speed: Math.abs(Math.cos(seed * 1.7)) * 0.3 + 0.1,
				opacity: Math.abs(Math.sin(seed * 3.2)) * 0.5 + 0.3,
			};
		});
	}, [width, height]);

	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(to bottom, #0a0a0f 0%, #1a0a2e 100%)',
			}}
		>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				{stars.map((star, i) => {
					const offsetX = Math.sin(frame * star.speed * 0.01) * 20;
					const offsetY = frame * star.speed * 0.5;
					const currentY = (star.y + offsetY) % (height + 100);

					return (
						<circle
							key={i}
							cx={star.x + offsetX}
							cy={currentY}
							r={star.size}
							fill="white"
							opacity={star.opacity}
						/>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};
