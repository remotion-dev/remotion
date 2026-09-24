import {loadFont} from '@remotion/fonts';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

loadFont({
	family: 'GT Planar',
	url: staticFile('GT Planar/GT-Planar-Bold.woff2'),
	weight: '700',
});

const SlidingTitle: React.FC<{readonly text: string}> = ({text}) => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
			<div
				style={{
					color: '#15151e',
					fontFamily: 'GT Planar',
					fontSize: 240,
					fontWeight: 700,
					letterSpacing: -12,
					lineHeight: 1,
					whiteSpace: 'nowrap',
					translate: interpolate(frame, [0, 18], ['-1700px 0px', '0px 0px'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.22, 1, 0.36, 1),
					}),
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

export const MotionBlurSlideIn: React.FC<{readonly text: string}> = ({
	text,
}) => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<HtmlInCanvasMotionBlur
				width={width}
				height={height}
				shutterAngle={360}
				samples={24}
			>
				<SlidingTitle text={text} />
			</HtmlInCanvasMotionBlur>
		</AbsoluteFill>
	);
};
