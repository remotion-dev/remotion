import {loadFont} from '@remotion/fonts';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {HtmlInCanvasDocsVideoFallback} from './HtmlInCanvasDocsVideoFallback';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

if (typeof window !== 'undefined') {
	loadFont({
		family: 'GT Planar',
		url: staticFile('img/gt-planar-bold.woff2'),
		weight: '700',
	});
}

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

export const MotionBlurHtmlInCanvasLiveDemo: React.FC<MotionBlurDemoProps> = ({
	darkMode = false,
}) => {
	const {width, height} = useVideoConfig();

	return (
		<Sequence playbackRate={0.25}>
			<AbsoluteFill
				style={{
					backgroundColor: darkMode ? '#15151e' : '#fff',
					overflow: 'hidden',
				}}
			>
				<HtmlInCanvasMotionBlur
					width={width}
					height={height}
					samples={24}
					shutterAngle={360}
				>
					<SlidingText darkMode={darkMode} />
				</HtmlInCanvasMotionBlur>
			</AbsoluteFill>
		</Sequence>
	);
};

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
				src={
					darkMode
						? 'https://remotion.media/docs/motion-blur/html-in-canvas-dark-66d727429c60.mp4'
						: 'https://remotion.media/docs/motion-blur/html-in-canvas-92f3ebdb2818.mp4'
				}
			/>
		);
	}

	return <MotionBlurHtmlInCanvasLiveDemo darkMode={darkMode} />;
};
