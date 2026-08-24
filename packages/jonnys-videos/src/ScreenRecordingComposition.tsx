import {blur} from '@remotion/effects/blur';
import {noise} from '@remotion/effects/noise';
import {rings} from '@remotion/effects/rings';
import {wave} from '@remotion/effects/wave';
import {
	AbsoluteFill,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const SCREEN_RECORDING_DURATION_IN_FRAMES = 280;

export const ScreenRecordingComposition: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();

	return (
		<AbsoluteFill>
			<Solid
				width={1080}
				height={1920}
				color={'#191919'}
				style={{
					position: 'absolute',
				}}
				effects={[
					rings({
						colors: ['#000000', '#0b0b0b'],
						center: interpolate(
							frame,
							[0, 279],
							[
								[0, 1],
								[1, 0],
							],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						thickness: interpolate(
							frame,
							[0, durationInFrames - 1],
							[84.1, 146.3],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						),
						gap: 24.8,
					}),
					wave({
						phase: interpolate(frame, [0, durationInFrames - 1], [200, 229], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}),
					blur({
						radius: 20,
					}),
					noise({
						amount: 0.25,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
