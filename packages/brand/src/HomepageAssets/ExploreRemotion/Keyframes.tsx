import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Video} from '@remotion/media';
import {AbsoluteFill, HtmlInCanvas, Sequence} from 'remotion';
import {ExploreKeyframesRecording20261027Composition} from '../../ExploreKeyframesRecording20261027Composition';

export const keyframesCloseupDuration = 154;

// Preserve the full capture so the final tilt cannot reveal pre-cropped edges.
export const KeyframesCloseupEdit = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#14171a', overflow: 'visible'}}>
			<Sequence from={-116} layout="none" name="Move the cursor keyframes">
				<ExploreKeyframesRecording20261027Composition />
			</Sequence>
		</AbsoluteFill>
	);
};

export const ExploreRemotionKeyframes = () => {
	return (
		<HtmlInCanvas
			name="Keyframe editing"
			width={1080}
			height={1080}
			durationInFrames={keyframesCloseupDuration}
			effects={[
				radialProgressiveBlur({
					center: [0.64, 0.73],
					width: 1.3,
					height: 1.1,
					start: 0.35,
					endBlur: 7,
				}),
			]}
		>
			<div
				style={{
					position: 'relative',
					width: 1080,
					height: 1080,
					backgroundColor: '#14171a',
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
						name="Pre-composed keyframe recording"
						src={
							'https://remotion.media/explore-remotion/keyframes-full-precomp-2026-10-27-5c273730059a.mp4'
						}
						durationInFrames={keyframesCloseupDuration}
						muted
						style={{
							position: 'absolute',
							left: -930,
							top: -165,
							width: 2194,
							height: 1438,
							scale: 1.05,
							transformOrigin: 'top left',
						}}
					/>
				</div>
			</div>
		</HtmlInCanvas>
	);
};
