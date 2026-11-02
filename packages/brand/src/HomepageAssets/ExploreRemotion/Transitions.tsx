import {AbsoluteFill, Sequence} from 'remotion';
import {ExploreZoomBlurRecording20261028Composition} from '../../ExploreZoomBlurRecording20261028Composition';
import {EXPLORE_CAMERA_ANGLE} from './camera-angle';

export const transitionsDuration = 84;

export const ExploreRemotionTransitions = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#1e2226'}}>
			<AbsoluteFill
				name="Zoom Blur transition close-up"
				style={{
					overflow: 'visible',
					rotate: EXPLORE_CAMERA_ANGLE,
					transformOrigin: 'center',
				}}
			>
				<AbsoluteFill
					name="Capture framing"
					style={{
						width: 2896,
						height: 1842,
						left: -285,
						top: 9,
						scale: 0.57,
						transformOrigin: 'top left',
						overflow: 'visible',
					}}
				>
					<Sequence from={-156} layout="none" name="Play from A to B">
						<ExploreZoomBlurRecording20261028Composition />
					</Sequence>
				</AbsoluteFill>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
