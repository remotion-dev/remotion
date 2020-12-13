import {
	spring,
	SpringConfig,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import styled from 'styled-components';

const Logo = styled.img`
	height: 180px;
	position: absolute;
`;

const squircleSize = 220;

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

export const EndLogo: React.FC = () => {
	const f = useCurrentFrame();
	const frame = f / 2;
	const videoConfig = useVideoConfig();

	const springConfig: SpringConfig = {
		damping: 8,
		mass: 0.2,
		stiffness: 100,
		overshootClamping: false,
	};

	const scale = spring({
		config: springConfig,
		from: 14,
		to: 1,
		fps: videoConfig.fps,
		frame,
	});
	const logoScale = spring({
		config: springConfig,
		from: 0,
		to: 1,
		frame,
		fps: videoConfig.fps,
	});
	const squirclefactor = spring({
		config: springConfig,
		from: 0.5,
		to: 1.05,
		frame,
		fps: videoConfig.fps,
	});

	return (
		<div
			style={{
				flex: 1,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<svg
				viewBox={`0 0 ${squircleSize} ${squircleSize}`}
				style={{
					height: squircleSize,
					width: squircleSize,
					transform: `scale(${scale})`,
				}}
			>
				<path
					d={makeSquircle(squircleSize, squircleSize, squirclefactor)}
					fill="#5851db"
				/>
			</svg>
			<Logo
				style={{transform: `scale(${logoScale})`}}
				src="https://www.anysticker.app/logo-transparent.png"
			/>
		</div>
	);
};

export default EndLogo;
