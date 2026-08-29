import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {noise} from '@remotion/effects/noise';
import {scanlines} from '@remotion/effects/scanlines';
import {
	AbsoluteFill,
	Easing,
	HtmlInCanvas,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {MyComponent} from './Composition';

export const MasterWithEffect: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, height, width} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<HtmlInCanvas
				name="Master CRT screen"
				width={width}
				height={height}
				effects={[
					scanlines({
						amount: interpolate(
							frame,
							[
								durationInFrames - 45,
								durationInFrames - 45 + 5,
								durationInFrames - 20 - 11,
							],
							[0, 0.38, 0.58],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.1,
									overshootClamping: false,
								}),
							},
						),
						spacing: 5,
						thickness: 2,
						offset: frame * 3,
						premultiply: true,
					}),
					chromaticAberration({
						amount:
							interpolate(
								frame,
								[
									durationInFrames - 45,
									durationInFrames - 45 + 3,
									durationInFrames - 20 - 11,
								],
								[0, 14, 34],
								{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
							) *
							(0.35 + Math.abs(Math.sin(frame * 2.7)) * 0.65),
						angle: frame % 4 < 2 ? 0 : 180,
					}),
					noise({
						amount:
							interpolate(
								frame,
								[
									durationInFrames - 45,
									durationInFrames - 45 + 7,
									durationInFrames - 20 - 11,
								],
								[0, 0.14, 0.36],
								{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
							) *
							(0.45 + Math.abs(Math.sin(frame * 4.1)) * 0.55),
						seed: frame,
						premultiply: false,
					}),
				]}
				style={{
					opacity: interpolate(
						frame,
						[durationInFrames - 20 - 1, durationInFrames - 20],
						[1, 0],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					),
					scale: `${interpolate(
						frame,
						[
							durationInFrames - 20 - 11,
							durationInFrames - 20 - 4,
							durationInFrames - 20,
						],
						[1, 1, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					)} ${interpolate(
						frame,
						[durationInFrames - 20 - 11, durationInFrames - 20 - 6],
						[1, 0.012],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.1,
								overshootClamping: false,
							}),
						},
					)}`,
					translate: `${
						Math.sin(frame * 5.3) *
						interpolate(
							frame,
							[durationInFrames - 45, durationInFrames - 20 - 11],
							[0, 12],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							},
						)
					}px 0px`,
					transformOrigin: 'center center',
				}}
			>
				<MyComponent />
			</HtmlInCanvas>
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(210,235,255,0.55) 16%, rgba(255,255,255,0) 68%)',
					opacity: interpolate(
						frame,
						[
							durationInFrames - 20 - 11,
							durationInFrames - 20 - 6,
							durationInFrames - 20 - 2,
							durationInFrames - 20,
						],
						[0, 0.9, 0.35, 0],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
					scale: `${interpolate(
						frame,
						[durationInFrames - 20 - 6, durationInFrames - 20],
						[1, 0],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)} ${interpolate(
						frame,
						[durationInFrames - 20 - 11, durationInFrames - 20 - 6],
						[1, 0.006],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}`,
				}}
			/>
		</AbsoluteFill>
	);
};
