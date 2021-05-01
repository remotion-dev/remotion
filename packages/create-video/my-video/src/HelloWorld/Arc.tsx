import {useVideoConfig} from 'remotion';
import {COLOR_1, COLOR_2} from './config';

export const Arc: React.FC<{
	progress: number;
	rotation: number;
	rotateProgress: number;
}> = ({progress, rotation, rotateProgress}) => {
	const config = useVideoConfig();
	const cx = config.width / 2;
	const cy = config.height / 2;

	const rx = config.height / 8;
	const ry = rx * 2.2;
	const arcLength = Math.PI * 2 * Math.sqrt((rx * rx + ry * ry) / 2);
	const strokeWidth = arcLength / 60;

	return (
		<svg
			viewBox={`0 0 ${config.width} ${config.height}`}
			style={{
				position: 'absolute',
				transform: `rotate(${rotation * rotateProgress}deg)`,
			}}
		>
			<defs>
				<linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stopColor={COLOR_1} />
					<stop offset="100%" stopColor={COLOR_2} />
				</linearGradient>
			</defs>
			<ellipse
				cx={cx}
				cy={cy}
				rx={rx}
				ry={ry}
				fill="none"
				stroke="url(#gradient)"
				strokeDasharray={arcLength}
				strokeDashoffset={arcLength - arcLength * progress}
				strokeLinecap="round"
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
};
