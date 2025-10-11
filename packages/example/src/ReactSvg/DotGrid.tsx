import React from 'react';
import {useVideoConfig} from 'remotion';
import styled from 'styled-components';

const StyledSvg = styled.svg`
	position: absolute;
`;

export const DotGrid: React.FC = () => {
	const videoConfig = useVideoConfig();

	const dotSpacing = Math.ceil(videoConfig.width / 50);
	const rows = Math.ceil(videoConfig.height / dotSpacing);
	return (
		<StyledSvg viewBox={`0 0 ${videoConfig.width} ${videoConfig.height}`}>
			{new Array(50).fill(true).map((_, i) => {
				return new Array(rows).fill(true).map((_j, j) => {
					return (
						<circle
							key={j}
							r={2}
							cx={i * dotSpacing}
							cy={j * dotSpacing}
							fill="rgba(0, 0, 0, 0.1)"
						/>
					);
				});
			})}
		</StyledSvg>
	);
};
