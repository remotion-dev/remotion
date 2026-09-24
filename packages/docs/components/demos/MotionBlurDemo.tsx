import {loadFont} from '@remotion/fonts';
import {
	CameraMotionBlur,
	HtmlInCanvasMotionBlur,
	Trail,
} from '@remotion/motion-blur';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

loadFont({
	family: 'GT Planar',
	url: staticFile('img/gt-planar-bold.woff2'),
	weight: '700',
});

type MotionBlurDemoProps = {
	readonly darkMode?: boolean;
};

const SlidingText: React.FC<{readonly darkMode: boolean}> = ({darkMode}) => {
	const frame = useCurrentFrame();
	const {width} = useVideoConfig();
	const x = interpolate(frame, [0, 18], [-width * 1.8, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.bezier(0.22, 1, 0.36, 1),
	});

	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					color: darkMode ? '#fff' : '#15151e',
					fontFamily: 'GT Planar',
					fontSize: width * 0.18,
					fontWeight: 700,
					letterSpacing: -width * 0.009,
					lineHeight: 1,
					whiteSpace: 'nowrap',
					transform: `translateX(${x}px)`,
				}}
			>
				Remotion
			</div>
		</AbsoluteFill>
	);
};

const MotionBlurScene: React.FC<
	MotionBlurDemoProps & {
		readonly variant: 'trail' | 'camera' | 'html-in-canvas';
	}
> = ({variant, darkMode = false}) => {
	const {width, height} = useVideoConfig();
	const text = <SlidingText darkMode={darkMode} />;
	const blurred =
		variant === 'trail' ? (
			<Trail layers={12} lagInFrames={0.14} trailOpacity={0.8}>
				{text}
			</Trail>
		) : variant === 'camera' ? (
			<CameraMotionBlur samples={10} shutterAngle={360}>
				{text}
			</CameraMotionBlur>
		) : (
			<HtmlInCanvasMotionBlur
				width={width}
				height={height}
				samples={24}
				shutterAngle={360}
			>
				{text}
			</HtmlInCanvasMotionBlur>
		);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: darkMode ? '#15151e' : '#fff',
				overflow: 'hidden',
			}}
		>
			{blurred}
		</AbsoluteFill>
	);
};

export const MotionBlurTrailDocsDemo: React.FC<MotionBlurDemoProps> = ({
	darkMode,
}) => <MotionBlurScene variant="trail" darkMode={darkMode} />;

export const MotionBlurCameraDocsDemo: React.FC<MotionBlurDemoProps> = ({
	darkMode,
}) => <MotionBlurScene variant="camera" darkMode={darkMode} />;

export const MotionBlurHtmlInCanvasLiveDemo: React.FC<MotionBlurDemoProps> = ({
	darkMode,
}) => <MotionBlurScene variant="html-in-canvas" darkMode={darkMode} />;

export const MotionBlurHtmlInCanvasDocsDemo: React.FC<MotionBlurDemoProps> = ({
	darkMode = false,
}) => {
	const branch = useHtmlInCanvasDocsDemoBranch();

	if (branch === 'pending') {
		return (
			<AbsoluteFill style={{backgroundColor: darkMode ? '#15151e' : '#fff'}} />
		);
	}

	if (branch === 'fallback') {
		return (
			<HtmlInCanvasDocsVideoFallback
				relativeSrc={
					darkMode
						? 'img/motion-blur-html-in-canvas-dark.mp4'
						: 'img/motion-blur-html-in-canvas.mp4'
				}
			/>
		);
	}

	return <MotionBlurHtmlInCanvasLiveDemo darkMode={darkMode} />;
};
