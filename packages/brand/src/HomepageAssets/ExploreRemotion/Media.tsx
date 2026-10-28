import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Video} from '@remotion/media';
import {AbsoluteFill, HtmlInCanvas, Sequence} from 'remotion';
import {ExploreMediaRecording20261028Composition} from '../../ExploreMediaRecording20261028Composition';

export const mediaRecordingDuration = 294;

export const MediaRecordingEdit = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#18181b', overflow: 'visible'}}>
			<Sequence from={-144} layout="none" name="Browse media files and formats">
				<ExploreMediaRecording20261028Composition />
			</Sequence>
		</AbsoluteFill>
	);
};

export const MediaSquareEdit = () => {
	return (
		<AbsoluteFill
			name="remotion.media file catalog"
			durationInFrames={mediaRecordingDuration}
			style={{backgroundColor: '#18181b'}}
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
						left: -30,
						top: -205,
						width: 2510,
						height: 1440,
						scale: 1.05,
						transformOrigin: 'top left',
					}}
				>
					<MediaRecordingEdit />
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const ExploreRemotionMedia = () => {
	return (
		<HtmlInCanvas
			name="remotion.media catalog with soft edges"
			width={1080}
			height={1080}
			durationInFrames={mediaRecordingDuration}
			effects={[
				radialProgressiveBlur({
					center: [0.42, 0.5],
					width: 1.3,
					height: 1.25,
					start: 0.6,
					startBlur: 0,
					endBlur: 4,
				}),
			]}
		>
			<Video
				name="Pre-composed file catalog scroll"
				src="https://remotion.media/explore-remotion/media-scroll-precomp-default-2026-10-28-daa1fa92bc0b.mp4"
				muted
				durationInFrames={mediaRecordingDuration}
				style={{width: 1080, height: 1080}}
			/>
		</HtmlInCanvas>
	);
};
