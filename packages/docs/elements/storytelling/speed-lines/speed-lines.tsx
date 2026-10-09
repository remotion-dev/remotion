import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	random,
	useCurrentFrame,
	useVideoConfig,
	type InteractivitySchema,
} from 'remotion';

type SpeedLinesProps = {
	readonly color?: string;
};

const SpeedLinesInner: React.FC<SpeedLinesProps> = ({color = '#ffffff'}) => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const seed = Math.floor(frame / 2);
	const cx = width / 2;
	const cy = height / 2;
	const far = Math.hypot(width, height);
	const lines = new Array(56).fill(true).map((_, i) => {
		const angle = (i / 56) * Math.PI * 2 + random(`angle-${i}-${seed}`) * 0.08;
		const spread = 0.006 + random(`spread-${i}-${seed}`) * 0.014;
		const inner = 0.36 + random(`inner-${i}-${seed}`) * 0.22;
		const x1 = cx + Math.cos(angle - spread) * far;
		const y1 = cy + Math.sin(angle - spread) * far;
		const x2 = cx + Math.cos(angle + spread) * far;
		const y2 = cy + Math.sin(angle + spread) * far;
		const xi = cx + Math.cos(angle) * inner * (width / 2);
		const yi = cy + Math.sin(angle) * inner * (height / 2);
		return `M ${xi} ${yi} L ${x1} ${y1} L ${x2} ${y2} Z`;
	});

	return (
		<AbsoluteFill
			name="Speed lines fade"
			style={{
				opacity: interpolate(
					frame,
					[0, 3, durationInFrames - 5, durationInFrames - 1],
					[0, 0.85, 0.85, 0],
					{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
				),
			}}
		>
			<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
				{lines.map((d, i) => (
					<path key={i} d={d} fill={color} />
				))}
			</svg>
		</AbsoluteFill>
	);
};

const speedLinesSchema = {
	color: {type: 'color', default: '#ffffff', description: 'Color'},
} as const satisfies InteractivitySchema;

export const SpeedLines = Interactive.withSchema({
	Component: SpeedLinesInner,
	componentName: '<SpeedLines>',
	schema: speedLinesSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});
