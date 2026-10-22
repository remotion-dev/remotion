import {useState} from 'react';
import {
	AbsoluteFill,
	interpolate,
	random,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const Arc: React.FC<{rotation: number}> = ({rotation}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const [gradientId] = useState(() => String(random(null)));
	const progress = spring({
		frame,
		fps,
		config: {damping: 100, mass: 0.5},
	});
	const circumference = Math.PI * 2 * Math.sqrt((22 ** 2 + 50 ** 2) / 2);

	return (
		<svg
			viewBox="0 0 320 180"
			style={{
				position: 'absolute',
				transform: `rotate(${rotation * progress}deg)`,
			}}
		>
			<defs>
				<linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stopColor="#91EAE4" />
					<stop offset="100%" stopColor="#86A8E7" />
				</linearGradient>
			</defs>
			<ellipse
				cx={160}
				cy={90}
				rx={22}
				ry={50}
				fill="none"
				stroke={`url(#${gradientId})`}
				strokeDasharray={circumference}
				strokeDashoffset={circumference - circumference * progress}
				strokeLinecap="round"
				strokeWidth={8}
			/>
		</svg>
	);
};

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	const rotation = interpolate(frame, [0, 150], [0, 360]);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill style={{transform: `scale(0.9) rotate(${rotation}deg)`}}>
				<Arc rotation={30} />
				<Arc rotation={90} />
				<Arc rotation={-30} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const issue10676SvgGradientStroke = {
	component: Component,
	id: 'issue-10676-svg-gradient-stroke',
	width: 320,
	height: 180,
	fps: 30,
	durationInFrames: 150,
} as const;
