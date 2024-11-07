import {mix} from 'polished';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const makeSquircle = (w = 100, h = 100, curvature = 0.5): string => {
	const curveWidth = (w / 2) * (1 - curvature);
	const curveHeight = (h / 2) * (1 - curvature);
	return `
        M 0, ${h / 2}
        C 0, ${curveWidth} ${curveHeight}, 0 ${w / 2}, 0
        S ${w}, ${curveHeight} ${w}, ${h / 2}
            ${w - curveWidth}, ${h - 0} ${w / 2}, ${h}
            0, ${w - curveHeight} 0, ${h / 2}
    `;
};

export const Circle: React.FC<{
	readonly size: number;
}> = ({size}) => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();
	const progress = spring({
		config: {
			damping: 1000,
			mass: 0.7,
			stiffness: 10,
			overshootClamping: false,
		},
		fps: videoConfig.fps,
		frame,
		from: 0,
		to: 1,
	});
	const angle = interpolate(progress, [0, 1], [0, Math.PI * 2]);
	const squircleFactor = interpolate(progress, [0, 1], [0.5, 1.05]);
	const radius = videoConfig.width / 2;
	const left = videoConfig.width / 2 - size / 2;
	const top = videoConfig.height / 2 - size / 2;
	const x = radius * Math.cos(angle) + radius;
	const y = -radius * Math.sin(angle) + radius;
	const amountToMove = (videoConfig.width - size) * (1 - progress);
	const shade = 1 - Math.min(1, size / videoConfig.width);
	const color = mix(shade * 0.1, '#000', '#fff');

	return (
		<svg
			viewBox={`0 0 ${size} ${size}`}
			width={size}
			height={size}
			style={{
				position: 'absolute',
				left: left + amountToMove * x * 0.0003,
				top: top + amountToMove * y * 0.0003,
				WebkitFilter: 'drop-shadow(0 0 5px #5851db)',
			}}
		>
			<path d={makeSquircle(size, size, squircleFactor)} fill={color} />
		</svg>
	);
};
