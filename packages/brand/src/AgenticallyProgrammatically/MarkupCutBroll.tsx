import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {Video} from '@remotion/media';
import {
	HtmlInCanvas,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';

const MarkupBrollContent = ({
	action,
}: {
	readonly action: 'cut' | 'paste' | 'move';
}) => {
	const frame = useCurrentFrame();
	const isPaste = action === 'paste';
	const isMove = action === 'move';
	const duration = isMove ? 157 : isPaste ? 79 : 103;

	return (
		<HtmlInCanvas
			name={
				isMove
					? 'Angled Monaco cut, scroll and paste'
					: isPaste
						? 'Angled Monaco paste'
						: 'Angled Monaco selection and cut'
			}
			width={1920}
			height={1080}
			style={{backgroundColor: '#131414'}}
			effects={[
				linearProgressiveBlur({
					start: [0.5, 0.72],
					end: [0.5, 0.98],
					endBlur: 4,
				}),
			]}
		>
			<Video
				name={
					isMove
						? 'Move HigherLevelTaskPrompt to another scene'
						: isPaste
							? 'Paste HigherLevelTaskPrompt into another section'
							: 'Select HigherLevelTaskPrompt line by line, then cut'
				}
				src={
					isMove
						? 'https://remotion.media/agentically-programmatically/higher-level-markup-move-2e59c83aae49.mp4'
						: isPaste
							? 'https://remotion.media/agentically-programmatically/higher-level-markup-paste-b9c5fc2306d3.mp4'
							: 'https://remotion.media/agentically-programmatically/higher-level-markup-cut-4410309f992e.mp4'
				}
				durationInFrames={duration}
				muted
				style={{
					position: 'absolute',
					left: 100,
					top: -35,
					width: 1600,
					height: 1100,
					transformOrigin: '100px 400px',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: interpolate(
						frame,
						[0, duration - 1],
						isMove ? [1.2, 1.27] : isPaste ? [1.24, 1.27] : [1.2, 1.24],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
				}}
			/>
		</HtmlInCanvas>
	);
};

export const MarkupCutBroll = Interactive.create({
	Component: () => <MarkupBrollContent action="cut" />,
	layout: 'absolute-fill',
	schema: {},
});

export const MarkupPasteBroll = Interactive.create({
	Component: () => <MarkupBrollContent action="paste" />,
	layout: 'absolute-fill',
	schema: {},
});

export const MarkupMoveBroll = Interactive.create({
	Component: () => <MarkupBrollContent action="move" />,
	layout: 'absolute-fill',
	schema: {},
});
