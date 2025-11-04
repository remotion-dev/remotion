import React from 'react';
import {useVideoConfig} from 'remotion';
import {COLOR_1, COLOR_2} from './config';

export const Atom: React.FC<{
	readonly scale: number;
}> = ({scale}) => {
	const config = useVideoConfig();
	return (
		<svg
			viewBox={`0 0 ${config.width} ${config.height}`}
			style={{
				position: 'absolute',
				transform: `scale(${scale})`,
			}}
		>
			<defs>
				<linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor={COLOR_1} />
					<stop offset="100%" stopColor={COLOR_2} />
				</linearGradient>
			</defs>
			<circle
				r={70}
				cx={config.width / 2}
				cy={config.height / 2}
				fill="url(#gradient2)"
			/>
		</svg>
	);
};
