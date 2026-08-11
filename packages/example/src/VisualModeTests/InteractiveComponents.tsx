import React from 'react';
import {AbsoluteFill, Interactive, useCurrentFrame} from 'remotion';

const labelStyle: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 28,
	color: '#e2e8f0',
	margin: 0,
};

export const InteractiveHtmlElements: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{backgroundColor: '#0f172a'}}>
			<Interactive.H1
				style={{
					position: 'absolute',
					top: 70,
					left: 90,
					margin: 0,
					fontFamily: 'sans-serif',
					fontSize: 82,
					color: '#f8fafc',
					letterSpacing: -4,
				}}
			>
				Interactive HTML
			</Interactive.H1>
			<Interactive.Div
				style={{
					position: 'absolute',
					top: 220,
					left: 110,
					width: 420,
					padding: 36,
					borderRadius: 28,
					background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
					boxShadow: '0 30px 80px rgba(37, 99, 235, 0.35)',
				}}
			>
				<Interactive.P
					style={{
						...labelStyle,
						fontSize: 36,
						fontWeight: 800,
						marginBottom: 18,
					}}
				>
					Drag the card
				</Interactive.P>
				<Interactive.Span
					style={{
						...labelStyle,
						display: 'block',
						lineHeight: 1.35,
					}}
				>
					This is an <Interactive.Strong>Interactive.Div</Interactive.Strong>{' '}
					containing interactive text elements.
				</Interactive.Span>
			</Interactive.Div>
			<Interactive.Button
				style={{
					position: 'absolute',
					left: 650,
					top: 240,
					border: 0,
					borderRadius: 999,
					padding: '28px 44px',
					backgroundColor: '#f8fafc',
					color: '#0f172a',
					fontSize: 34,
					fontWeight: 800,
					boxShadow: '0 20px 60px rgba(248, 250, 252, 0.22)',
				}}
			>
				Button
			</Interactive.Button>
			<Interactive.P
				style={{
					position: 'absolute',
					left: 620,
					top: 390,
					width: 350,
					margin: 0,
					fontFamily: 'sans-serif',
					fontSize: 38,
					color: '#facc15',
					letterSpacing: 2,
					lineHeight: 1.15,
					textAlign: 'center',
				}}
			>
				Editable text schema
			</Interactive.P>
			<Interactive.Section
				style={{
					position: 'absolute',
					left: 570,
					top: 520,
					width: 390,
					padding: 28,
					borderRadius: 24,
					border: '3px solid #38bdf8',
					transform: `rotate(${Math.sin(frame / 20) * 4}deg)`,
				}}
			>
				<Interactive.Code
					style={{
						fontSize: 26,
						color: '#67e8f9',
						fontFamily: 'monospace',
					}}
				>
					&lt;Interactive.Section /&gt;
				</Interactive.Code>
			</Interactive.Section>
		</AbsoluteFill>
	);
};

export const InteractiveSvgElements: React.FC = () => {
	const frame = useCurrentFrame();
	const radius = 130 + Math.sin(frame / 18) * 12;

	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(180deg, #020617, #111827)',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Interactive.Svg
				width={720}
				height={720}
				viewBox="0 0 720 720"
				style={{
					overflow: 'visible',
				}}
			>
				<Interactive.Circle
					cx={360}
					cy={360}
					r={radius}
					fill="#38bdf8"
					opacity={0.22}
					stroke="#67e8f9"
					strokeWidth={8}
				/>
				<Interactive.Rect
					x={175}
					y={185}
					width={370}
					height={260}
					rx={44}
					fill="#7c3aed"
					opacity={0.82}
				/>
				<Interactive.Path
					d="M190 500 C290 415 430 585 540 485"
					fill="none"
					stroke="#facc15"
					strokeLinecap="round"
					strokeWidth={28}
				/>
				<Interactive.Text
					x={360}
					y={360}
					textAnchor="middle"
					dominantBaseline="middle"
					fill="#fff"
					fontFamily="sans-serif"
					fontSize={52}
					fontWeight={800}
				>
					SVG
				</Interactive.Text>
			</Interactive.Svg>
		</AbsoluteFill>
	);
};
