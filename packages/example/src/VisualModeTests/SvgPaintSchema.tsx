import React from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

export const SvgPaintSchema: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#020617',
				color: '#e2e8f0',
				fontFamily: 'sans-serif',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					fontSize: 48,
					fontWeight: 700,
					marginBottom: 24,
				}}
			>
				SVG paint and stroke width controls
			</div>
			<div
				style={{
					color: '#94a3b8',
					fontSize: 24,
					marginBottom: 32,
				}}
			>
				Select a named SVG element and edit its paint or stroke width
			</div>
			<Interactive.Svg
				name="SVG root"
				width={880}
				height={620}
				viewBox="0 0 880 620"
				fill="#38bdf8"
				style={{
					backgroundColor: '#0f172a',
					borderRadius: 32,
				}}
			>
				<path d="M70 90 L130 40 L190 90 L170 170 L90 170 Z" />
				<Interactive.G
					name="Group paint"
					fill={'#7f7794'}
					strokeWidth={interpolate(frame, [0], [1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}
				>
					<circle cx={330} cy={105} r={65} />
					<path
						d="M290 105 H370 M330 65 V145"
						fill="none"
						strokeLinecap="round"
					/>
				</Interactive.G>
				<Interactive.Circle
					name="Circle paint"
					cx={540}
					cy={105}
					r={65}
					fill="#fb7185"
					stroke="#ffe4e6"
					strokeWidth={10}
				/>
				<Interactive.Ellipse
					name="Ellipse paint"
					cx={750}
					cy={105}
					rx={85}
					ry={55}
					fill="#fbbf24"
					stroke="#fef3c7"
					strokeWidth={10}
				/>
				<Interactive.Rect
					name="Rectangle paint"
					x={65}
					y={250}
					width={190}
					height={130}
					rx={28}
					fill="#34d399"
					stroke="#d1fae5"
					strokeWidth={42}
				/>
				<Interactive.Path
					name="Path paint"
					d="M325 360 C375 215 455 215 505 360 Z"
					fill="#60a5fa"
					stroke="#dbeafe"
				/>
				<Interactive.Line
					name="Line paint"
					x1={585}
					y1={260}
					x2={805}
					y2={370}
					stroke="#f472b6"
					strokeWidth={24}
					strokeLinecap="round"
				/>
				<Interactive.Text
					name="Text paint"
					x={440}
					y={520}
					fill="#f8fafc"
					stroke="#7c3aed"
					strokeWidth={2}
					textAnchor="middle"
					fontFamily="sans-serif"
					fontSize={74}
					fontWeight={800}
				>
					Editable SVG paint
				</Interactive.Text>
			</Interactive.Svg>
		</AbsoluteFill>
	);
};
