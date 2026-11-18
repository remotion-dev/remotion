import {Video} from '@remotion/media';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import React from 'react';
import {
	AbsoluteFill,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const slowMotionRate = 0.25;

const BouncingVideo: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const horizontalRange = width - 320;
	const verticalRange = height - 180;
	const time = (frame / fps) * slowMotionRate;
	const horizontalTravel = time * 840 + 96;
	const verticalTravel = time * 570 + 64;
	const x =
		horizontalRange -
		Math.abs((horizontalTravel % (2 * horizontalRange)) - horizontalRange);
	const y =
		verticalRange -
		Math.abs((verticalTravel % (2 * verticalRange)) - verticalRange);

	return (
		<Video
			name="Bouncing video"
			src={staticFile('drums-drumsticks.mp4')}
			muted
			loop
			playbackRate={slowMotionRate}
			objectFit="cover"
			style={{
				position: 'absolute',
				width: 320,
				height: 180,
				translate: `${x}px ${y}px`,
			}}
		/>
	);
};

export const BouncingVideoMotionBlur: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#101318'}}>
			<HtmlInCanvasMotionBlur
				name="Video motion blur"
				width={1280}
				height={720}
				shutterAngle={360}
				samples={16}
				disabled={false}
				disabledInPreview={false}
			>
				<BouncingVideo />
			</HtmlInCanvasMotionBlur>
		</AbsoluteFill>
	);
};
