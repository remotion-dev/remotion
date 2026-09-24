import {
	CameraMotionBlur,
	HtmlInCanvasMotionBlur,
	Trail,
} from '@remotion/motion-blur';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

const MovingArtwork: React.FC = () => {
	const frame = useCurrentFrame();
	const x = interpolate(frame, [0, 45, 90], [-180, 990, -180]);

	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: 175,
				width: 180,
				height: 180,
				borderRadius: 32,
				background: 'linear-gradient(135deg, #ffe064, #ff735c)',
				boxShadow: '0 18px 50px #0008',
				transform: `rotate(${frame * 4}deg)`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: '#2d1830',
				fontFamily: 'sans-serif',
				fontSize: 110,
				fontWeight: 800,
			}}
		>
			M
		</div>
	);
};

const MotionBlurScene: React.FC<{
	readonly variant: 'trail' | 'camera' | 'html-in-canvas';
}> = ({variant}) => {
	const {width, height} = useVideoConfig();
	const artwork = <MovingArtwork />;
	const blurred =
		variant === 'trail' ? (
			<Trail layers={12} lagInFrames={0.14} trailOpacity={0.8}>
				{artwork}
			</Trail>
		) : variant === 'camera' ? (
			<CameraMotionBlur samples={8} shutterAngle={180}>
				{artwork}
			</CameraMotionBlur>
		) : (
			<HtmlInCanvasMotionBlur
				width={width}
				height={height}
				samples={8}
				shutterAngle={180}
			>
				{artwork}
			</HtmlInCanvasMotionBlur>
		);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#171626',
				backgroundImage:
					'linear-gradient(#ffffff0b 1px, transparent 1px), linear-gradient(90deg, #ffffff0b 1px, transparent 1px)',
				backgroundSize: '60px 60px',
				overflow: 'hidden',
			}}
		>
			{blurred}
		</AbsoluteFill>
	);
};

export const MotionBlurTrailDocsDemo: React.FC = () => (
	<MotionBlurScene variant="trail" />
);

export const MotionBlurCameraDocsDemo: React.FC = () => (
	<MotionBlurScene variant="camera" />
);

export const MotionBlurHtmlInCanvasLiveDemo: React.FC = () => (
	<MotionBlurScene variant="html-in-canvas" />
);

export const MotionBlurHtmlInCanvasDocsDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return <AbsoluteFill style={{backgroundColor: '#171626'}} />;
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback relativeSrc="img/motion-blur-html-in-canvas.mp4" />
		);
	}

	return <MotionBlurHtmlInCanvasLiveDemo />;
};
