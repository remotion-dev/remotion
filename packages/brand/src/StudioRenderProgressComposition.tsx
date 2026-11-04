import {MacOSCursor} from '@remotion/mac-cursors';
import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Interactive,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const StudioRenderProgressCapture = () => {
	const {fps} = useVideoConfig();
	const frame = (useCurrentFrame() * 30) / fps;

	return (
		<AbsoluteFill
			name="Canvas Capture"
			durationInFrames={(812 / 30) * fps}
			style={{
				width: 1854,
				height: 1532,
			}}
		>
			<Video
				src="https://remotion.media/studio-close-ups/render-progress-d9221e224f59.mp4"
				muted
				durationInFrames={(812 / 30) * fps}
				style={{
					position: 'absolute',
				}}
			/>
			<MacOSCursor
				cursor={'auto'}
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					scale: interpolate(frame, [0, 807], [4.6, 4.6], {
						easing: Easing.step1,
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					translate: interpolate(
						frame,
						[
							5, 7, 8, 9, 11, 12, 15, 16, 18, 19, 26, 27, 29, 30, 36, 37, 39,
							40, 42, 43, 167, 168, 775, 776, 777, 779, 780, 782, 783, 788, 789,
							791, 792, 794, 795, 798, 799, 800, 801,
						],
						[
							'-1629.6218749999998px 4268.620312499999px',
							'-1629.6218749999998px 4268.620312499999px',
							'746.1523437499999px 2319.89140625px',
							'956.35078125px 2063.90859375px',
							'956.35078125px 2063.90859375px',
							'1011.51484375px 2011.0624999999998px',
							'1011.51484375px 2011.0624999999998px',
							'1226.1335937499998px 2123.13359375px',
							'1226.1335937499998px 2123.13359375px',
							'1228.5054687499999px 2125.43359375px',
							'1228.5054687499999px 2125.43359375px',
							'996.3851562499999px 2219.41015625px',
							'996.3851562499999px 2219.41015625px',
							'892.5437499999999px 2293.7109375px',
							'892.5437499999999px 2293.7109375px',
							'895.70625px 2294.2320312499996px',
							'895.70625px 2294.2320312499996px',
							'1033.6343749999999px 2324.45546875px',
							'1033.6343749999999px 2324.45546875px',
							'1038.953125px 2325.46171875px',
							'1038.953125px 2325.46171875px',
							'1844.2226562499998px 2429.4109375px',
							'1844.2226562499998px 2429.4109375px',
							'1455.6484375px 4479.573437499999px',
							'1356.37109375px 4570.585156249999px',
							'1356.37109375px 4570.585156249999px',
							'208.32968749999998px 4602.084374999999px',
							'208.32968749999998px 4602.084374999999px',
							'-554.7312499999999px 4601.940624999999px',
							'-554.7312499999999px 4601.940624999999px',
							'-1278.56640625px 4567.9078125px',
							'-1278.56640625px 4567.9078125px',
							'-1678.6226562499999px 4492.70859375px',
							'-1678.6226562499999px 4492.70859375px',
							'-1709.8703125px 4497.721874999999px',
							'-1709.8703125px 4497.721874999999px',
							'-1711.5953124999999px 4492.34921875px',
							'-1726.4374999999998px 4489.007031249999px',
							'-1726.6531249999998px 4489.007031249999px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
				}}
			/>
		</AbsoluteFill>
	);
};

const StudioRenderProgressContent = () => {
	const {width, height} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: '#1f2327'}}>
			<AbsoluteFill
				name="Render progress - centered job"
				style={{
					width: 1854,
					height: 1532,
					left: '50%',
					top: '50%',
					translate: '-1045px -640px',
					transformOrigin: '1045px 640px',
					rotate: '-4deg',
					scale: 1.5 * Math.min(width / 2560, height / 1600),
				}}
			>
				<StudioRenderProgressCapture />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const StudioRenderProgressComposition = Interactive.create({
	Component: StudioRenderProgressContent,
	layout: 'absolute-fill',
	schema: Interactive.backgroundSchema,
});
