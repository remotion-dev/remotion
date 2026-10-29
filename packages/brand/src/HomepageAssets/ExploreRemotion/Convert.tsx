import {EXPLORE_CAMERA_ANGLE} from './camera-angle';
import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Video} from '@remotion/media';
import {AbsoluteFill, HtmlInCanvas, Sequence} from 'remotion';
import {ExploreConvertRecording20261028Composition} from '../../ExploreConvertRecording20261028Composition';

export const convertRecordingDuration = 300;

export const ConvertRecordingEdit = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#151515',
				overflow: 'visible',
				translate: '217.2px -139.3px',
				scale: 1.274,
			}}
		>
			<Sequence from={-420} layout="none" name="Finish conversion and download">
				<ExploreConvertRecording20261028Composition />
			</Sequence>
		</AbsoluteFill>
	);
};

export const ConvertSquareEdit = () => {
	return (
		<HtmlInCanvas
			width={1080}
			height={1080}
			from={0}
			durationInFrames={300}
			trimBefore={0}
			effects={[
				radialProgressiveBlur({
					height: 0.716,
					width: 1.782,
					endBlur: 18,
					center: [0.366, 0.676],
				}),
			]}
		>
			<AbsoluteFill
				name="Conversion progress and completed file"
				durationInFrames={convertRecordingDuration}
				style={{backgroundColor: '#151515'}}
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
							left: -80,
							top: -90,
							width: 1332,
							height: 1440,
							scale: 0.82,
							transformOrigin: 'top left',
						}}
					>
						<ConvertRecordingEdit />
					</div>
				</div>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};

export const ExploreRemotionConvert = () => {
	return (
		<HtmlInCanvas
			name="Convert with focus on progress and download"
			width={1080}
			height={1080}
			durationInFrames={convertRecordingDuration}
			effects={[
				radialProgressiveBlur({
					center: [0.48, 0.72],
					width: 1.2,
					height: 1,
					start: 0.5,
					startBlur: 0,
					endBlur: 5,
				}),
			]}
		>
			<Video
				name="Pre-composed conversion and download"
				src="https://remotion.media/explore-remotion/convert-reframed-precomp-2026-10-28-c0492393659e.mp4"
				muted
				durationInFrames={convertRecordingDuration}
				style={{width: 1080, height: 1080}}
			/>
		</HtmlInCanvas>
	);
};
