import {Video} from '@remotion/media';
import {Interactive, useVideoConfig} from 'remotion';

const MotionBlurBounceContent = () => {
	const {width, height, fps} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				backgroundColor: '#191e23',
				perspective: 1800,
			}}
		>
			<Video
				name="Bouncing drumsticks close-up"
				src="https://remotion.media/motion-blur-2026-11-17/drumsticks-motion-blur-capture-2-a46bb51a0a4e.mp4"
				trimBefore={Math.round(8.8 * fps)}
				playbackRate={1}
				cropRight={0.07}
				muted
				style={{
					position: 'absolute',
					width: 1870,
					height: 1440,
					left: '50%',
					top: '48%',
					translate: '-1068px -610px',
					scale: Math.min(width / 1080, height / 960) * 0.7,
					rotate: '0.978875 0.167552 -0.117176 24.679771deg',
					transformOrigin: '1068px 610px',
				}}
			/>
		</div>
	);
};

export const MotionBlurBounce = Interactive.create({
	Component: MotionBlurBounceContent,
	layout: 'absolute-fill',
	schema: {},
});
