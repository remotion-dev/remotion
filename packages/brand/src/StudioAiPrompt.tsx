import {Video} from '@remotion/media';
import {
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from './HomepageAssets/ExploreRemotion/camera-angle';

const StudioAiPromptContent = () => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();

	return (
		<Interactive.Div
			name="AI prompt - tight typing view"
			style={{
				position: 'absolute',
				width: 1284,
				height: 500,
				left: '57%',
				top: '50%',
				translate: '-50% -50%',
				overflow: 'hidden',
				borderRadius: 24,
				rotate: EXPLORE_CAMERA_ANGLE,
				scale:
					Math.min(width / 2560, height / 1600) *
					interpolate(frame, [0, durationInFrames - 1], [2.3, 2.15], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.bezier(0.2, 0, 0.4, 1),
						output: 'perceptual-scale',
					}),
			}}
		>
			<Video
				name="Real prompt typing - 9x"
				src="https://remotion.media/explore-remotion/ai-prompt-source-2026-10-20-74886aec9d9a.mp4"
				trimBefore={6.9 * fps}
				durationInFrames={3.6 * fps}
				playbackRate={9}
				muted
				style={{
					position: 'absolute',
					left: -210,
					top: -570,
					width: 1494,
					height: 1440,
				}}
			/>
		</Interactive.Div>
	);
};

export const StudioAiPrompt = Interactive.create({
	Component: StudioAiPromptContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
