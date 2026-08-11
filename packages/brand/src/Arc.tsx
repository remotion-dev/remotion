import {mix} from 'polished';
import {useVideoConfig} from 'remotion';
import {BLUE} from './colors';

export const Arc: React.FC<{
	progress: number;
	rotation: number;
	rotateProgress: number;
}> = ({progress, rotation, rotateProgress}) => {
	const config = useVideoConfig();
	const cx = config.width / 2;
	const cy = config.height / 2;

	const rx = config.height / 6;
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
				<linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop stopColor={mix(0.8, '#fff', BLUE)} offset="0" />
					<stop stopColor={mix(0.8, '#fff', BLUE)} offset="100%" />
				</linearGradient>
			</defs>
			<ellipse
				cx={cx}
				cy={cy}
				rx={rx}
				ry={ry}
				fill="none"
				stroke="url(#g)"
				strokeDasharray={arcLength}
				strokeDashoffset={arcLength - arcLength * progress}
				strokeLinecap="round"
				strokeWidth={strokeWidth}
			/>
		</svg>
	);
};
