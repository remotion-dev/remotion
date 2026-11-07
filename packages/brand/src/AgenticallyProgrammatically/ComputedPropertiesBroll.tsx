import {
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {ComputedPropertiesCaptureComposition} from './ComputedPropertiesCaptureComposition';

const ComputedPropertiesBrollContent = () => {
	const frame = useCurrentFrame();
	return (
		<HtmlInCanvas
			name="Computed transform properties"
			width={1920}
			height={1080}
			style={{backgroundColor: '#1d2327'}}
		>
			<Interactive.Div
				name="Slow push into the computed labels"
				style={{
					position: 'absolute',
					left: -496,
					top: -100,
					width: 2416,
					height: 1440,
					transformOrigin: '100% 0%',
					rotate: EXPLORE_CAMERA_ANGLE,
					scale: interpolate(frame, [0, 139], [1, 1.035], {
						easing: Easing.linear,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
				}}
			>
				<Sequence trimBefore={15} durationInFrames={91} playbackRate={0.65}>
					<ComputedPropertiesCaptureComposition />
				</Sequence>
			</Interactive.Div>
		</HtmlInCanvas>
	);
};

export const ComputedPropertiesBroll = Interactive.create({
	Component: ComputedPropertiesBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
