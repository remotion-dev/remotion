import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {AbsoluteFill, HtmlInCanvas} from 'remotion';
import {ExploreBuildingRecording20261028Composition} from '../../ExploreBuildingRecording20261028Composition';
import {EXPLORE_CAMERA_ANGLE} from './camera-angle';

export const backgroundRemovalDuration = 357;

export const BackgroundRemovalRecordingEdit = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#1f2428', overflow: 'visible'}}>
			<ExploreBuildingRecording20261028Composition />
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
				radialProgressiveBlur({
					center: [0.5, 0.49],
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
						rotate: EXPLORE_CAMERA_ANGLE,
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: -260,
							top: 0,
							width: 2102,
							height: 1440,
							scale: 0.75,
							transformOrigin: 'top left',
						}}
					>
						<BackgroundRemovalRecordingEdit />
					</div>
				</div>
			</div>
		</HtmlInCanvas>
	);
};
