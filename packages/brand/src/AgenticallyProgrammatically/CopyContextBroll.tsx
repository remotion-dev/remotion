import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {
	Easing,
	Freeze,
	HtmlInCanvas,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';
import {EXPLORE_CAMERA_ANGLE} from '../HomepageAssets/ExploreRemotion/camera-angle';
import {CopyContextCaptureComposition} from './CopyContextCaptureComposition';

const CopyContextBrollContent = () => {
	const frame = useCurrentFrame();
	const preClickFrame = frame < 94 ? frame : Math.max(94, frame - 30);
	const playbackFrame =
		preClickFrame < 103 ? preClickFrame : Math.max(103, preClickFrame - 15);

	return (
		<Freeze frame={playbackFrame}>
			<HtmlInCanvas
				name="Copy context menu with progressive blur"
				width={1920}
				height={1080}
				style={{backgroundColor: '#1f2427'}}
				effects={[
					linearProgressiveBlur({
						start: [0.5, 0.35],
						end: [0.9, 0.95],
						endBlur: 16,
					}),
				]}
			>
				<Interactive.Div
					name="Close-up of Copy context for agents"
					style={{
						position: 'absolute',
						left: '50%',
						top: 400,
						width: 1604,
						height: 1440,
						translate: interpolate(
							playbackFrame,
							[42, 78],
							['-1000px -1020px', '-1180px -525px'],
							{
								easing: Easing.bezier(0.42, 0, 0.58, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						transformOrigin: interpolate(
							playbackFrame,
							[42, 78],
							['1000px 1020px', '1180px 525px'],
							{
								easing: Easing.bezier(0.42, 0, 0.58, 1),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						rotate: EXPLORE_CAMERA_ANGLE,
						scale: interpolate(playbackFrame, [42, 78], [1.6, 2.2], {
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						}),
					}}
				>
					<Sequence
						name="Right-click and copy context"
						trimBefore={15}
						durationInFrames={104}
						layout="none"
					>
						<CopyContextCaptureComposition />
					</Sequence>
				</Interactive.Div>
			</HtmlInCanvas>
		</Freeze>
	);
};

export const CopyContextBroll = Interactive.create({
	Component: CopyContextBrollContent,
	layout: 'absolute-fill',
	schema: {},
});
