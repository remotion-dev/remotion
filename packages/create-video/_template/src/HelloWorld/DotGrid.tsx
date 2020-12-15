import {useVideoConfig} from 'remotion';

export const DotGrid: React.FC = () => {
	const videoConfig = useVideoConfig();
	const dotSpacing = Math.ceil(videoConfig.width / 50);
	const rows = Math.ceil(videoConfig.height / dotSpacing);
	return (
		<svg
			viewBox={`0 0 ${videoConfig.width} ${videoConfig.height}`}
			style={{position: 'absolute'}}
		>
			{new Array(50).fill(true).map((_, i) => {
				return new Array(rows).fill(true).map((_j, j) => {
					return (
						<circle
							// eslint-disable-next-line react/no-array-index-key
							key={j}
							r={2}
							cx={i * dotSpacing}
							cy={j * dotSpacing}
							fill="rgba(0, 0, 0, 0.1)"
						/>
					);
				});
			})}
		</svg>
	);
};
