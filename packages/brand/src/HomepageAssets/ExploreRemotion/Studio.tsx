import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Video} from '@remotion/media';
import {
	AbsoluteFill,
	Easing,
	HtmlInCanvas,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {ExploreStudioRecording20261027Composition} from '../../ExploreStudioRecording20261027Composition';

export const studioRecordingDuration = 312;

// Keep the complete recording through the tilt; only the final tile crops it.
export const StudioRecordingEdit = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#1f2428', overflow: 'visible'}}>
			<Sequence from={-87} layout="none" name="Browse the Studio menus">
				<ExploreStudioRecording20261027Composition />
			</Sequence>
		</AbsoluteFill>
	);
};

export const ExploreRemotionStudio = () => {
	const frame = useCurrentFrame();

	return (
		<HtmlInCanvas
			name="Studio menus"
			width={1080}
			height={1080}
			durationInFrames={studioRecordingDuration}
			effects={[
				radialProgressiveBlur({
					center: [0.54, 0.45],
					width: 1.6,
					height: 1.6,
					start: 0.45,
					endBlur: 4,
				}),
			]}
		>
			<div
				style={{
					position: 'relative',
					width: 1080,
					height: 1080,
					backgroundColor: '#1f2428',
					overflow: 'visible',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'visible',
						rotate: '0.12 1 -0.15 20deg',
						scale: 1.02,
					}}
				>
					<Video
						name="Pre-composed Studio recording"
						src="https://remotion.media/explore-remotion/studio-full-precomp-2026-10-27-d929e00efcb1.mp4"
						durationInFrames={studioRecordingDuration}
						muted
						style={{
							position: 'absolute',
							left: interpolate(
								frame,
								[0, 35, 75, 115, 180, 235, 312],
								[-150, -400, -750, -1200, -1800, -2140, -2140],
								{
									easing: Easing.bezier(0.33, 0, 0.67, 1),
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
								},
							),
							top: 90,
							width: 2330,
							height: 1440,
							scale: 1.5,
							transformOrigin: 'top left',
						}}
					/>
				</div>
			</div>
		</HtmlInCanvas>
	);
};
