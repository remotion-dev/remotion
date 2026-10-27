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
					rotate: '0.904608 0.351506 -0.241096 27.995464deg',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 46,
						top: -501,
						width: 1260,
						height: 1682,
						scale: 1.02,
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
					center: [0.325, 0.9],
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
				src="https://remotion.media/explore-remotion/player-zoom-precomp-2026-10-27-f25cfe2b5a1a.mp4"
				muted
				durationInFrames={playerRecordingDuration}
				style={{width: 1080, height: 1080}}
			/>
		</HtmlInCanvas>
	);
};
