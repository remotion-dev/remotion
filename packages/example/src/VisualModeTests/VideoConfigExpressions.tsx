import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const expressionStyle: React.CSSProperties = {
	fontFamily: 'monospace',
	fontSize: 20,
	lineHeight: 1.45,
	margin: 0,
	whiteSpace: 'pre-wrap',
};

const cardTitleStyle: React.CSSProperties = {
	fontFamily: 'sans-serif',
	fontSize: 28,
	fontWeight: 700,
	margin: '0 0 18px',
};

export const VideoConfigExpressions: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps, height, width} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#08111f',
				color: '#e8eef8',
				fontFamily: 'sans-serif',
			}}
		>
			<div
				style={{
					left: 0,
					padding: '52px 70px',
					position: 'absolute',
					top: 0,
					zIndex: 1,
				}}
			>
				<h1 style={{fontSize: 48, margin: 0}}>Video config expressions</h1>
				<p style={{color: '#9fb0c8', fontSize: 24, margin: '14px 0 0'}}>
					Select the named sequences and edit their values in Visual Mode.
				</p>
			</div>
			<Sequence
				name="Static multiplications — appears at frame 60"
				from={(2 * fps) as number}
				durationInFrames={fps * 2.5}
				premountFor={0.5 * fps}
				postmountFor={fps * 0.5}
				width={width * 0.42}
				height={0.36 * height}
				style={{
					backgroundColor: '#12335b',
					border: '2px solid #4ea1ff',
					borderRadius: 28,
					flexDirection: 'column',
					padding: 30,
					translate: '70px 205px',
				}}
			>
				<h2 style={cardTitleStyle}>Static props</h2>
				<pre style={{...expressionStyle, color: '#a9d2ff'}}>
					{'from={(2 * fps) as number}\n'}
					{'durationInFrames={fps * 2.5}\n'}
					{'width={width * 0.42}\n'}
					{'height={0.3 * height}'}
				</pre>
			</Sequence>
			<Sequence
				name="Keyframes — 3.33 * fps and fps * 6"
				durationInFrames={durationInFrames}
				width={width * 0.42}
				height={height * 0.36}
				style={{
					backgroundColor: '#3a1c62',
					border: '2px solid #b37aff',
					borderRadius: 28,
					flexDirection: 'column',
					opacity: interpolate(frame, [1, 139], [0.35, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					padding: 30,
					scale: interpolate(
						frame,
						[0, 170.9, durationInFrames],
						[0.86, 1.08, 0.92],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					translate: '625px 205px',
				}}
			>
				<h2 style={cardTitleStyle}>Expression keyframes</h2>
				<pre style={{...expressionStyle, color: '#d3b7ff'}}>
					{'scale: [0, 3.33 * fps, durationInFrames]\n'}
					{'opacity: [0, fps * 6]\n'}
					{'Expected middle scale keyframe: 99.9'}
				</pre>
			</Sequence>
			<Sequence
				name="Control — division stays computed"
				from={fps / 2}
				durationInFrames={durationInFrames * 0.8}
				width={width * 0.88}
				height={height * 0.18}
				style={{
					alignItems: 'center',
					backgroundColor: '#39222b',
					border: '2px solid #e47a9a',
					borderRadius: 28,
					flexDirection: 'row',
					justifyContent: 'space-between',
					padding: 28,
					translate: '70px 520px',
				}}
			>
				<h2 style={{...cardTitleStyle, margin: 0, width: 420}}>
					Unsupported-expression control
				</h2>
				<pre style={{...expressionStyle, color: '#ffadc5'}}>
					{'from={fps / 2} should remain computed'}
				</pre>
			</Sequence>
		</AbsoluteFill>
	);
};
