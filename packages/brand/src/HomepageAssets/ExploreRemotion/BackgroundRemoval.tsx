import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Video} from '@remotion/media';
import {AbsoluteFill, HtmlInCanvas, Sequence} from 'remotion';
import {ExploreBackgroundRemovalRecording20261027Composition} from '../../ExploreBackgroundRemovalRecording20261027Composition';
import {preservePink} from './preserve-pink';

export const backgroundRemovalDuration = 300;

export const BackgroundRemovalRecordingEdit = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#1f2428', overflow: 'visible'}}>
			<Sequence from={-42} layout="none" name="Align the separated foreground">
				<ExploreBackgroundRemovalRecording20261027Composition />
			</Sequence>
		</AbsoluteFill>
	);
};

export const ExploreRemotionBackgroundRemoval = () => {
	return (
		<HtmlInCanvas
			name="Background removal"
			width={1080}
			height={1080}
			durationInFrames={backgroundRemovalDuration}
			effects={[
				preservePink({saturation: 0}),
				radialProgressiveBlur({
					center: [0.36, 0.49],
					width: 1.45,
					height: 1.4,
					start: 0.3,
					endBlur: 6,
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
						rotate: '0.12 1 -0.15 18deg',
					}}
				>
					<Video
						name="Pre-composed background removal recording"
						src="https://remotion.media/explore-remotion/background-removal-full-precomp-2026-10-27-c3a506cbd24c.mp4"
						muted
						durationInFrames={backgroundRemovalDuration}
						style={{
							position: 'absolute',
							left: -620,
							top: -330,
							width: 1704,
							height: 1440,
							scale: 1.05,
							transformOrigin: 'top left',
						}}
					/>
				</div>
			</div>
		</HtmlInCanvas>
	);
};
