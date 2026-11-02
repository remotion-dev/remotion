import {EXPLORE_CAMERA_ANGLE} from './camera-angle';
import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Video} from '@remotion/media';
import {AbsoluteFill, HtmlInCanvas, Sequence} from 'remotion';
import {ExplorePlayerRecording20261027Composition} from '../../ExplorePlayerRecording20261027Composition';

export const playerRecordingDuration = 260;

export const PlayerRecordingEdit = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#1b1b1b', overflow: 'visible'}}>
			<Sequence
				from={-70}
				layout="none"
				name="Play the video and rearrange its cards"
			>
				<ExplorePlayerRecording20261027Composition />
			</Sequence>
		</AbsoluteFill>
	);
};

export const PlayerSquareEdit = () => {
	return (
		<AbsoluteFill
			name="Interactive Player"
			durationInFrames={playerRecordingDuration}
			style={{backgroundColor: '#1b1b1b'}}
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
						left: -7.9,
						top: -1050,
						width: 1260,
						height: 1682,
						scale: 1.326,
						transformOrigin: 'top left',
					}}
				>
					<PlayerRecordingEdit />
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const ExploreRemotionPlayer = () => {
	return (
		<HtmlInCanvas
			name="Player with focus on the play button"
			width={1080}
			height={1080}
			durationInFrames={playerRecordingDuration}
			effects={[
				radialProgressiveBlur({
					center: [0.325, 0.817],
					width: 1.15,
					height: 0.95,
					start: 0.22,
					startBlur: 0,
					endBlur: 14,
				}),
			]}
		>
			<Video
				name="Pre-composed Player interaction"
				src="https://remotion.media/explore-remotion/player-close-precomp-2026-10-28-3de88d580df5.mp4"
				muted
				durationInFrames={playerRecordingDuration}
				style={{width: 1080, height: 1080}}
			/>
		</HtmlInCanvas>
	);
};
