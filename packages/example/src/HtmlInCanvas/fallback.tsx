import {blur} from '@remotion/effects/blur';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {zoomBlur} from '@remotion/transitions/zoom-blur';
import React from 'react';
import {AbsoluteFill, HtmlInCanvas, useCurrentFrame} from 'remotion';

const MovingCard: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				left: 120 + Math.sin(frame / 15) * 80,
				top: 115,
				width: 130,
				height: 130,
				borderRadius: 24,
				background: 'linear-gradient(135deg, #fbbf24, #f472b6)',
				transform: `rotate(${frame * 3}deg)`,
				display: 'grid',
				placeItems: 'center',
				fontSize: 38,
				fontWeight: 700,
				color: '#211629',
			}}
		>
			DOM
		</div>
	);
};

export const HtmlInCanvasFallbackExample: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				background: '#10141e',
				color: '#f1f5f9',
				fontFamily: 'Arial, Helvetica, sans-serif',
				padding: 40,
			}}
		>
			<div style={{fontSize: 34, fontWeight: 700}}>HTML-in-canvas fallback</div>
			<div style={{fontSize: 18, color: '#94a3b8', marginTop: 12}}>
				Preview in a browser without HTML-in-canvas · Frame {frame}
			</div>
			<div style={{display: 'flex', gap: 24, marginTop: 42}}>
				<div>
					<div style={{fontSize: 20, marginBottom: 16}}>Nested components</div>
					<HtmlInCanvas
						width={384}
						height={430}
						effects={[blur({radius: 6})]}
						style={{background: '#1e293b', borderRadius: 12}}
					>
						<div style={{padding: '100px 24px 24px'}}>
							<div style={{fontSize: 24, marginBottom: 20}}>Outer content</div>
							<HtmlInCanvas
								width={336}
								height={240}
								effects={[blur({radius: 4})]}
								style={{background: '#31435e', borderRadius: 10}}
							>
								<div style={{padding: '110px 24px', fontSize: 24}}>
									Inner content
								</div>
							</HtmlInCanvas>
						</div>
					</HtmlInCanvas>
				</div>
				<div>
					<div style={{fontSize: 20, marginBottom: 16}}>Motion blur</div>
					<div
						style={{
							position: 'relative',
							width: 384,
							height: 430,
							background: '#1e293b',
							borderRadius: 12,
						}}
					>
						<HtmlInCanvasMotionBlur width={384} height={430}>
							<MovingCard />
						</HtmlInCanvasMotionBlur>
					</div>
				</div>
				<div>
					<div style={{fontSize: 20, marginBottom: 16}}>Shader transition</div>
					<div
						style={{
							position: 'relative',
							width: 384,
							height: 430,
							borderRadius: 12,
							overflow: 'hidden',
						}}
					>
						<TransitionSeries>
							<TransitionSeries.Sequence durationInFrames={120}>
								<AbsoluteFill
									style={{
										background: '#164e63',
										justifyContent: 'center',
										alignItems: 'center',
										fontSize: 36,
									}}
								>
									Scene A
								</AbsoluteFill>
							</TransitionSeries.Sequence>
							<TransitionSeries.Transition
								presentation={zoomBlur({})}
								timing={linearTiming({durationInFrames: 60})}
							/>
							<TransitionSeries.Sequence durationInFrames={120}>
								<AbsoluteFill
									style={{
										background: '#5b214e',
										justifyContent: 'center',
										alignItems: 'center',
										fontSize: 36,
									}}
								>
									Scene B
								</AbsoluteFill>
							</TransitionSeries.Sequence>
						</TransitionSeries>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
