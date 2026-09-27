import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

const panelWidth = 560;
const panelHeight = 430;

const MovingArtwork: React.FC = () => {
	const frame = useCurrentFrame();
	const x = interpolate(frame, [0, 25, 50, 75], [-130, 330, 0, 330], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const rotation = interpolate(frame, [0, 75], [-25, 350], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div style={{position: 'relative', width: panelWidth, height: panelHeight}}>
			<div
				style={{
					position: 'absolute',
					left: x,
					top: 116,
					width: 230,
					height: 170,
					borderRadius: 32,
					background: 'linear-gradient(135deg, #ffcf4a, #fb547a)',
					boxShadow: '0 20px 45px #0008',
					rotate: `${rotation}deg`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: '#1a1730',
					fontFamily: 'sans-serif',
					fontSize: 72,
					fontWeight: 900,
				}}
			>
				Aa
			</div>
			<div
				style={{
					position: 'absolute',
					left: panelWidth - x - 120,
					top: 280,
					width: 92,
					height: 92,
					borderRadius: '50%',
					backgroundColor: '#60e3f1',
					opacity: 0.7,
				}}
			/>
		</div>
	);
};

const Panel: React.FC<{label: string; children: React.ReactNode}> = ({
	label,
	children,
}) => {
	return (
		<div>
			<div
				style={{
					fontFamily: 'sans-serif',
					fontSize: 26,
					fontWeight: 700,
					marginBottom: 16,
					color: '#f7f5ff',
				}}
			>
				{label}
			</div>
			<div
				style={{
					position: 'relative',
					width: panelWidth,
					height: panelHeight,
					overflow: 'hidden',
					borderRadius: 24,
					backgroundColor: '#211d39',
					backgroundImage:
						'linear-gradient(45deg, #ffffff13 25%, transparent 25%, transparent 75%, #ffffff13 75%), linear-gradient(45deg, #ffffff13 25%, transparent 25%, transparent 75%, #ffffff13 75%)',
					backgroundSize: '32px 32px',
					backgroundPosition: '0 0, 16px 16px',
				}}
			>
				{children}
			</div>
		</div>
	);
};

export const HtmlInCanvasMotionBlurExample: React.FC = () => {
	return (
		<div
			style={{
				width: 1280,
				height: 720,
				backgroundColor: '#100d22',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 40,
			}}
		>
			<Panel label="Original">
				<MovingArtwork />
			</Panel>
			<Panel label="HTML-in-canvas motion blur">
				<HtmlInCanvasMotionBlur
					width={panelWidth}
					height={panelHeight}
					shutterAngle={180}
					samples={8}
				>
					<MovingArtwork />
				</HtmlInCanvasMotionBlur>
			</Panel>
		</div>
	);
};
