import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const maximumScreenshotWidth = 1350;
const minimumScreenshotWidth = 592;
const screenshotHeight = 748;
const screenshotCount =
	(maximumScreenshotWidth - minimumScreenshotWidth) / 2 + 1;
const initialRestDurationInFrames = 15;
const motionDurationInFrames = 30;
const contractedRestDurationInFrames = 30;
const expandedRestDurationInFrames = 30;
const expandStartFrame =
	initialRestDurationInFrames +
	motionDurationInFrames +
	contractedRestDurationInFrames;

export const designSystemsResponsiveDurationInFrames =
	expandStartFrame + motionDurationInFrames + expandedRestDurationInFrames;

export const DesignSystemsResponsive: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const shrinkProgress = spring({
		frame: frame - initialRestDurationInFrames,
		fps,
		durationInFrames: motionDurationInFrames,
		config: {
			damping: 18,
			mass: 1,
			stiffness: 120,
		},
	});
	const expandProgress = spring({
		frame: frame - expandStartFrame,
		fps,
		durationInFrames: motionDurationInFrames,
		config: {
			damping: 18,
			mass: 1,
			stiffness: 120,
		},
	});
	const progress =
		frame < expandStartFrame ? shrinkProgress : 1 - expandProgress;
	const screenshotIndex = Math.max(
		0,
		Math.min(screenshotCount - 1, Math.round(progress * (screenshotCount - 1))),
	);
	const screenshotWidth = maximumScreenshotWidth - screenshotIndex * 2;

	return (
		<AbsoluteFill
			style={{
				overflow: 'hidden',
			}}
		>
			<CanvasImage
				src={staticFile(
					`design-systems-responsive/studio-${screenshotWidth}.png`,
				)}
				style={{
					position: 'absolute',
					left: '50%',
					top: 24,
					translate: '-50% 0',
					width: screenshotWidth,
					height: screenshotHeight,
					borderRadius: 12,
				}}
			/>
		</AbsoluteFill>
	);
};
