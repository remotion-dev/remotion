import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {SvgLogo} from './SvgLogos/Logos';

const OutroLogo = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Interactive.Div
			name="Descending logo beat steps"
			style={{
				width: 410,
				height: 425,
				scale: interpolate(
					frame,
					// Final descending hits, relative to frame 969 of StudioUpdate.
					[0, 2, 6, 8, 14, 18].map((beat) => Math.round((beat / 30) * fps)),
					[2.2, 1.9, 1.55, 1.25, 1, 0.8],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.step1,
						output: 'perceptual-scale',
					},
				),
			}}
		>
			<SvgLogo variant="compact-white" />
		</Interactive.Div>
	);
};

const StudioClosingContent = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<Interactive.Div
			name="Slow logo zoom out"
			style={{
				position: 'absolute',
				inset: 0,
				// Finish the existing 0.8-second move, then hold when the scene is extended.
				scale: interpolate(
					frame,
					[0, Math.round(0.8 * fps) - 1],
					[1.06, 0.95],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					},
				),
			}}
		>
			<AbsoluteFill
				name="Remotion logo - quiet outro"
				style={{alignItems: 'center', justifyContent: 'center'}}
			>
				<OutroLogo />
			</AbsoluteFill>
		</Interactive.Div>
	);
};

export const StudioClosing = Interactive.create({
	Component: StudioClosingContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
