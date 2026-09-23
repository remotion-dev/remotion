import React from 'react';
import {AbsoluteFill, Interactive, useCurrentFrame} from 'remotion';

const labelStyle: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 28,
	fill: '#64748b',
};

export const InteractivePaths: React.FC = () => {
	const frame = useCurrentFrame();
	const swing = Math.sin(frame / 10) * 90;

	return (
		<AbsoluteFill style={{backgroundColor: '#020617'}}>
			<Interactive.Svg width={1080} height={1080} viewBox="0 0 1080 1080">
				<text x={90} y={70} style={labelStyle}>
					Interactive.Path testbed
				</text>

				{/* Open bezier curve */}
				<Interactive.Path
					name="Open curve"
					d="M 90 210 C 250 60 430 90 530 230 S 710 420 890 300"
					fill="none"
					stroke="#facc15"
					strokeWidth={26}
					strokeLinecap="round"
				/>
				<text x={90} y={470} style={labelStyle}>
					open curve
				</text>

				{/* Closed filled shape */}
				<Interactive.Path
					name="Closed triangle"
					d="M 870 350 L 1010 560 L 730 560 Z"
					fill="#7c3aed"
					fillOpacity={0.7}
					stroke="#c4b5fd"
					strokeWidth={12}
					strokeLinejoin="round"
				/>
				<text x={790} y={640} style={labelStyle}>
					closed shape
				</text>

				{/* Multiple subpaths in one element */}
				<Interactive.Path
					name="Multi subpath"
					d="M 120 430 L 230 430 L 175 540 Z M 260 430 L 370 430 L 315 540 Z"
					fill="#22d3ee"
					fillOpacity={0.55}
					stroke="#67e8f9"
					strokeWidth={10}
					strokeLinejoin="round"
				/>
				<text x={120} y={600} style={labelStyle}>
					multi subpath
				</text>

				{/* Animated path data */}
				<Interactive.Path
					name="Animated wave"
					d={`M 80 800 Q 250 ${710 + swing} 420 800 T 760 800 T 1040 800`}
					fill="none"
					stroke="#f472b6"
					strokeWidth={18}
					strokeLinecap="round"
				/>
				<text x={80} y={880} style={labelStyle}>
					animated d
				</text>

				{/* Path inside a transformed group */}
				<Interactive.G name="Rotated group" transform="rotate(-14 420 980)">
					<Interactive.Path
						name="Group arc"
						d="M 250 1030 Q 420 860 590 1030"
						fill="none"
						stroke="#a3e635"
						strokeWidth={22}
						strokeLinecap="round"
					/>
				</Interactive.G>
				<text x={650} y={1000} style={labelStyle}>
					inside rotated group
				</text>

				{/* Dashed stroke */}
				<Interactive.Path
					name="Dashed curve"
					d="M 700 700 C 780 770 950 800 1030 750"
					fill="none"
					stroke="#e879f9"
					strokeWidth={16}
					strokeDasharray="34 26"
					strokeLinecap="round"
				/>
			</Interactive.Svg>
		</AbsoluteFill>
	);
};
